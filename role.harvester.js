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
                console.log('ERROR - harvester ' + creep.name + ' has no harvest target');
            }
            
            return false;
        }
        
        creep.manageState();
        
        if (!creep.memory.working) {
            
            if (creep.harvest(Game.getObjectById(creep.memory.harvestTarget)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.harvestTarget));
            }
            
        } else {
            
            if (!roleHarvester.storeEnergy(creep)) {
                creep.moveToIdlePosition();
            }
            
        }
    },
    
    storeEnergy: function(creep) {
        
        if (creep.storeEnergyToContainer('in')) {
            return true;
        }
        if (creep.storeEnergyToSpawn()) {
            return true;
        }
        if (creep.storeEnergyToExtention()) {
            return true;
        }
        if (creep.storeEnergyToTower()) {
            return true;
        }
        if (creep.storeEnergyToContainer()) {
            return true;
        }
        
        return false;
    }
};

module.exports = roleHarvester;
