/*
 * Role harvester
 *
 * harvester role that handles energy harvesting
 *
 */
 
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.harvestTarget || creep.memory.harvestTarget == undefined) {
            creep.memory.harvestTarget = creep.room.getHarvestTarget();
            
            if (Constant.DEBUG >= 3) { console.log('VERBOSE - harvester ' + creep.name + ' target set to: ' + creep.memory.harvestTarget); }
        }
        
        if (!creep.memory.harvestTarget || creep.memory.harvestTarget == undefined) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - ERROR - harvester ' + creep.name + ' has no harvest target'); }
            
            return false;
        }
        
        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('⛏️');
            }
        }
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        if (creep.memory.dropHarvest) {
            this.doDropHarvest(creep);
        } else {
            this.doCarryHarvest(creep);
        }
        
        return true;
    },
    
    getBody: function(energy) {
        let bodyParts = [];
        let extrasCost = 100;
        
        bodyParts.push(MOVE);
        bodyParts.push(CARRY);
        
        let workUnits = Math.floor((energy - extrasCost) / 100);
        workUnits = workUnits > 5 ? 5 : workUnits;
        for (let i = 0; i < workUnits; i++) {
            bodyParts.push(WORK);
        }
        
        return bodyParts;
    },
    
    doSpawn: function(spawn, body) {
        if (!spawn) { return false; }
        if (!body || body.length < 1) { return false; }
        
        let harvestTarget = false;
        let source = Game.getObjectById(spawn.room.getHarvestTarget());
        if (source) {
            harvestTarget = source.id;
        }
        
        return spawn.createCreep(body, undefined, {role: 'harvester', harvestTarget: harvestTarget, dropHarvest: false});
    },
    
    /** @param {Creep} creep **/
    getStoreEnergyLocation: function(creep) {
        if (!creep) { return false; }
        
        let targets = creep.getTargetSpawnEnergy('store');
        if (targets.length > 0) {
            targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
            
            return creep.setGoingTo(targets[0]);
        }
        
        targets = creep.getTargetContainerEnergy('store', 'in', true);
        if (targets.length > 0) { 
            targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
            
            return creep.setGoingTo(targets[0]);
        }
        
        targets = creep.getTargetExtentionEnergy('store');
        if (targets.length > 0) {
            targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
            
            return creep.setGoingTo(targets[0]);
        }
        
        targets = creep.getTargetContainerEnergy('store', 'all');
        if (targets.length == 0 || !targets) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));

        return creep.setGoingTo(targets[0]);
    },
    
    doStoreEnergy: function(creep) {
        if (!creep) { return false; }
        
        let target = Game.getObjectById(creep.memory.goingTo);
        
        if (!target) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - source: ' + source.id + ' lost local container'); }
            source.clearContainer();
            creep.memory.goingTo = false;
            
            return false;
        }
        
        creep.transferEnergy(target);

        return true;
    },
    
    doCarryHarvest: function(creep) {
        if (!creep) { return false; }
        
        let source = Game.getObjectById(creep.memory.harvestTarget);
        
        if (!creep.memory.working) {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            
            return true;
        }
            
        if (!creep.memory.goingTo) {
            creep.memory.goingTo = source.getLocalContainer();
        }
        
        if (!creep.memory.goingTo) {
            if (!this.getStoreEnergyLocation(creep)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                
                return false;
            }
        }
        
        this.doStoreEnergy(creep);
    },
    
    doDropHarvest: function(creep) {
        if (!creep) { return false; }
        
        let source = Game.getObjectById(creep.memory.harvestTarget);
        let target = Game.getObjectById(source.getDropContainer());

        if (!target) {
            if (Constant.DEBUG >= 3) { console.log('VERBOSE - ERROR - harvester ' + creep.name + ' has no drop container'); }
            source.clearContainer();
            creep.setDespawn();
            
            return false;
        }
        
        if (!creep.memory.atSource) {
            if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
                creep.memory.atSource = true;
            } else {
                creep.moveTo(target.pos.x, target.pos.y);
                return true;
            }
        }
        
        if (_.sum(target.store) >= (target.storeCapacity * Constant.ENERGY_CONTAINER_MAX_PERCENT)) {
            return true;
        }
        
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - ERROR - harvester ' + creep.name + ' not in range of ' + source.id); }
            
            return false;
        }
        
        return true;
    },

};

module.exports = roleHarvester;
