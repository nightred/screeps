/*
 * Role Upgrader
 *
 * upgrader role does work on the room controller
 *
 */
 
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
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleUpgrader.withdrawEnergy(creep)) {
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
            if (creep.getTargetExtentionEnergy()) {
                return true;
            }
            if (creep.getTargetSpawnEnergy()) {
                return true;
            }
        }
        
        return false;
    }
};

module.exports = roleUpgrader;
