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
            creep.memory.harvestTarget = creep.getHarvestTarget();
            
            if (Constant.DEBUG) {
                console.log('DEBUG - harvester ' + creep.name + ' target set to: ' + creep.memory.harvestTarget);
            }
        }
        
        if (!creep.memory.harvestTarget || creep.memory.harvestTarget == undefined) {
            if (Constant.DEBUG) {
                console.log('DEBUG - ERROR - harvester ' + creep.name + ' has no harvest target');
            }
            
            return false;
        }
        
        creep.manageState()
        
        if (!creep.memory.working) {
            let target = Game.getObjectById(creep.memory.harvestTarget);
            
            if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleHarvester.storeEnergy(creep)) {
                    creep.moveToIdlePosition();
                    
                    return false;
                }
            }
            
            let target = Game.getObjectById(creep.memory.goingTo);
            creep.transferEnergy(target);
            
            return true;
        }
    },
    
    /** @param {Creep} creep **/
    storeEnergy: function(creep) {
        
        if (creep.getTargetContainerEnergy('store', 'in', false)) {
            return true;
        }
        if (creep.getTargetSpawnEnergy('store')) {
            return true;
        }
        if (creep.getTargetExtentionEnergy('store')) {
            return true;
        }
        if (creep.getTargetTowerEnergy('store')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('store')) {
            return true;
        }
        
        return false;
    }
};

module.exports = roleHarvester;
