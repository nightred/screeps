var roleRepairer = require('role.repairer');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚧 build');
            } else {
                creep.say('🔋 energy');
            }
        }
        
        if (creep.memory.working) {
            if (!creep.buildConstructionSite()) {
                roleRepairer.run(creep);
            }
        }
        else {
            if (!roleBuilder.withdrawEnergy(creep)) {
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

module.exports = roleBuilder;