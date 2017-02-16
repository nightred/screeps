/*
 * Role Repairer
 *
 * repairer role handles structures with hit damage
 * downgrades to upgrader when no repair jobs are found
 *
 */
 
var roleUpgrader = require('role.upgrader');

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
                creep.memory.idleStart = Game.time;
                creep.moveToIdlePosition();
            }
        }
        else {
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleRepairer.withdrawEnergy(creep)) {
                    if (!creep.isCarryingEnergy()) {
                        creep.moveToIdlePosition();
                    } else {
                        creep.toggleState();
                    }
                    
                    return false;
                }
            }
            
            let target = Game.getObjectById(creep.memory.goingTo);
            creep.withdrawEnergy(target);
            
            return true;
        }
    },
    
    /** @param {Creep} creep **/
    withdrawEnergy: function(creep) {
        
        if (creep.getTargetContainerEnergy('withdraw', 'out')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw')) {
            return true;
        }
        if (creep.room.controller.level <= Constant.CONTROLLER_WITHDRAW_LEVEL) {
            if (creep.getTargetExtentionEnergy('withdraw')) {
                return true;
            }
            if (creep.getTargetSpawnEnergy('withdraw')) {
                return true;
            }
        }
        
        return false;
    }
};

module.exports = roleRepairer;