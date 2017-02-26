/*
 * work Remote Harvest
 *
 * remote.harvest work handles the harvesting of remote room energy
 *
 */

var workRemoteHarvest = {

    run: function(creep, work) {
        if (!creep) { return false; }
        if (!work) { return false; }
        
        if (!creep.memory.working) {
            creep.memory.travelTime = creep.memory.travelTime || 0;
            
            if (creep.room.name != work.room) {
                creep.moveToRoom(work.room);
                if (!work.travelTime) {
                    creep.memory.travelTime++;
                }
                
                return true;
            }
            
            if (!work.travelTime) {
                work.travelTime = creep.memory.travelTime;
            }
            
            if (!work.sourceCount) {
                work.sourceCount = creep.room.getSourceCount();
            }
            
            this.doCarryHarvest(creep);
        } else {
            if (creep.room.name != work.spawnRoom) {
                creep.moveToRoom(work.spawnRoom);
                
                return true;
            }
            
            this.doStoreEnergy(creep);
        }
        
        return true;
    },
    
    doManage: function(work) {
        if (!work) { return false; }
        work.spawnCooldown = work.spawnCooldown || 0;
        
        if (work.sourceCount && work.creepLimit != work.sourceCount) {
                work.creepLimit = work.sourceCount;
        }
        
        if (work.creeps.length < work.creepLimit && QSpawn.getQueueInRoomByRole(work.spawnRoom, 'remote.harvester').length == 0) {
            work.spawnCooldown++;
        } else {
            if (work.spawnCooldown != 0) {
                work.spawnCooldown = 0;
            }
        }
        
        if (work.spawnCooldown >= 10) {
            QSpawn.addQueue(work.spawnRoom, 'remote.harvester', 60);
        }

        return true;
    },
    
    doCarryHarvest: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.harvestTarget) {
            creep.room.cleanSourceHarvesters();
            let sources = _.filter(creep.room.getSources(), source => 
                !source.memory.harvester
                );
            if (sources.length > 0) {
                sources[0].setHarvester(creep.name);
                creep.memory.harvestTarget = sources[0].id;
            
                if (Constant.DEBUG >= 3) { console.log('VERBOSE - remote harvester ' + creep.name + ' target set to: ' + creep.memory.harvestTarget); }
            } else {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - ERROR - remote harvester ' + creep.name + ' has no harvest target'); }
                
                return false;
            }
        }
        
        let source = Game.getObjectById(creep.memory.harvestTarget);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
        
        return true;
    },
    
    doStoreEnergy: function(creep) {
        if (!creep) { return false; }

        if (!creep.memory.goingTo) {
            if (!this.getStoreEnergyLocation(creep)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                
                return false;
            }
        }
        
        let target = Game.getObjectById(creep.memory.goingTo);
        
        if (!target) {
            creep.memory.goingTo = false;
            
            return false;
        }
        
        creep.transferEnergy(target);
        
        return true;
    },
    
    /** @param {Creep} creep **/
    getStoreEnergyLocation: function(creep) {
        if (!creep) { return false; }
        
        let targets = creep.getTargetContainerEnergy('store', 'all');
        let storage = creep.getTargetStorageEnergy('store');
        if (storage) {
            targets.push(storage);
        }
        
        if (targets.length == 0 || !targets) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return creep.setGoingTo(targets[0]);
    },
    
};

module.exports = workRemoteHarvest;
