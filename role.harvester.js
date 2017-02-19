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
            
            if (Constant.DEBUG >= 2) { console.log('DEBUG - harvester ' + creep.name + ' target set to: ' + creep.memory.harvestTarget); }
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

    },
    
    /** @param {Creep} creep **/
    getStoreEnergyLocation: function(creep) {
        if (!creep) { return false; }
        
        let spawn = creep.getTargetSpawnEnergy('store');
        if (spawn) { return creep.setGoingTo(spawn); }
        
        let targets = creep.getTargetContainerEnergy('store', 'in', true);
        
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
        if (targets.length == 0) { return false; }
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
            if (Constant.DEBUG >= 3) { console.log('DEBUG - ERROR - harvester ' + creep.name + ' has no drop container'); }
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
