var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('⚡ upgrade');
            } else {
                creep.say('🔋 energy');
            }
        }
        
        if(creep.memory.working) {
            
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            
        } else {

            if (!roleUpgrader.withdrawEnergy(creep)) {
                creep.moveToIdlePosition();
            }
        }
    },
    
    withdrawEnergy: function(creep) {
        
        if (creep.withdrawEnergyFromContainer('out')) {
            return true;
        }
        if (creep.withdrawEnergyFromContainer()) {
            return true;
        }
        if (creep.withdrawEnergyFromContainer('in')) {
            return true;
        }
        if (creep.withdrawEnergyFromExtention()) {
            return true;
        }
        if (creep.withdrawEnergyFromSpawn()) {
            return true;
        }
        
        return false;
    }
};

module.exports = roleUpgrader;
