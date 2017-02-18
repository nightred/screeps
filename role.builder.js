/*
 * Role Builder
 *
 * builder role that handles all construction jobs
 * downgrades to repair when no build jobs are active
 *
 */

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
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }        
        if (creep.memory.working) {
            if (!creep.buildConstructionSite()) {
                roleRepairer.run(creep);
            }
        }
        else {
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleBuilder.withdrawEnergy(creep)) {
                    if (!creep.isCarryingEnergy()) {
                        creep.memory.idleStart = Game.time;
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
        
        if (creep.getTargetStorageEnergy('withdraw')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw', 'out')) {
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

module.exports = roleBuilder;
