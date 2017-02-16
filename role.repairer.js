var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🔧 repair');
            } else {
                creep.say('🔋 energy');
            }
        }
        
        if (creep.memory.working) {
            if (!creep.repairStructures()) {
                creep.moveToIdlePosition();
            }
        }
        else {
            if (!roleRepairer.withdrawEnergy(creep)) {
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

module.exports = roleRepairer;