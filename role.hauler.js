var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚛 haul');
            } else {
                creep.say('🔋 energy');
            }
        }
        
        if (creep.memory.working) {
            if (!roleHauler.storeEnergy(creep)) {
                creep.moveToIdlePosition();
            }
        }
        else {
            if (!roleHauler.withdrawEnergy(creep)) {
                
                if (!creep.isCarryingEnergy()) {
                    creep.moveToIdlePosition();
                } else {
                    creep.toggleState();
                }
                
            }
        }
    },
    
    storeEnergy: function(creep) {
        
        if (creep.storeEnergyToSpawn()) {
            return true;
        }
        if (creep.storeEnergyToExtention()) {
            return true;
        }
        if (creep.storeEnergyToTower()) {
            return true;
        }
        if (creep.storeEnergyToContainer('out', true)) {
            return true;
        }
        if (creep.storeEnergyToContainer()) {
            return true;
        }
        
        return false;
    },
    
    withdrawEnergy: function(creep) {
        
        //if (creep.collectDroppedEnergy()) {
        //    return true;
        //}
        if (creep.withdrawEnergyFromContainer('in', true)) {
            return true;
        }
        if (creep.withdrawEnergyFromContainer()) {
            return true;
        }
        
        return false;
    }
};

module.exports = roleHauler;