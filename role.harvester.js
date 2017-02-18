/*
 * Role harvester
 *
 * harvester role that handles energy harvesting
 *
 */
 
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (!creep.memory.harvestTarget || creep.memory.harvestTarget == undefined) {
            creep.memory.harvestTarget = creep.room.getHarvestTarget();
            
            if (Constant.DEBUG) { console.log('DEBUG - harvester ' + creep.name + ' target set to: ' + creep.memory.harvestTarget); }
        }
        
        if (!creep.memory.harvestTarget || creep.memory.harvestTarget == undefined) {
            if (Constant.DEBUG) { console.log('DEBUG - ERROR - harvester ' + creep.name + ' has no harvest target'); }
            
            return false;
        }
        
        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('⛏️ harvest');
            }
        }
        
        if (creep.memory.dropHarvest) {
            this.doDropHarvest(creep);
        } else {
            this.doCarryHarvest(creep);
        }

    },
    
    /** @param {Creep} creep **/
    getStorageLocation: function(creep) {
        
        if (creep.getTargetContainerEnergy('store', 'in', false)) {
            return true;
        }
        if (creep.getTargetSpawnEnergy('store')) {
            return true;
        }
        if (creep.getTargetExtentionEnergy('store')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('store')) {
            return true;
        }
        
        return false;
    },
    
    doStoreEnergy: function(creep) {
        let target = Game.getObjectById(creep.memory.goingTo);
        if (!target) {
            if (Constant.DEBUG) { console.log('DEBUG - source: ' + source.id + ' lost local container'); }
            source.clearContainer();
            creep.memory.goingTo = false;
            
            return false;
        }
        
        creep.transferEnergy(target);

        return true;
    },
    
    doCarryHarvest: function(creep) {
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
            if (!this.getStorageLocation(creep)) {
                creep.moveToIdlePosition();
                
                return false;
            }
        }
        
        this.doStoreEnergy();
    },
    
    doDropHarvest: function(creep) {
        let source = Game.getObjectById(creep.memory.harvestTarget);
        let target = Game.getObjectById(source.getDropContainer());

        if (!target) {
            if (Constant.DEBUG) { console.log('DEBUG - ERROR - harvester ' + creep.name + ' has no drop container'); }
            source.clearContainer();
            
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
            if (Constant.DEBUG) { console.log('DEBUG - ERROR - harvester ' + creep.name + ' not in range of ' + source.id); }
            
            return false;
        }
        
        return true;
    },

};

module.exports = roleHarvester;
