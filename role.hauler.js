/*
 * Role Hauler
 *
 * hauler role handles moving energy to needed locations
 *
 */

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
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        if (creep.memory.working) {
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleHauler.storeEnergy(creep)) {
                    creep.memory.idleStart = Game.time;
                    
                    return false;
                }
            }
            
            let target = Game.getObjectById(creep.memory.goingTo);
            creep.transferEnergy(target);
            
            return true;
        } else {
            if (creep.carry.energy > 0) {
                creep.toggleState();
                
                return true;
            }
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleHauler.withdrawEnergy(creep)) {
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
    
    doEmptyInContainer: function(creep) {
        
    },
    
    storeEnergy: function(creep) {
        
        if (creep.getTargetSpawnEnergy('store')) {
            return true;
        }
        if (creep.getTargetExtentionEnergy('store')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('store', 'out', true)) {
            return true;
        }
        if (!creep.memory.blockContainer) {
            if (creep.getTargetContainerEnergy('store')) {
                return true;
            }
            if (creep.getTargetStorageEnergy('store')) {
                return true;
            }
        }
        
        return false;
    },
    
    withdrawEnergy: function(creep) {
        
        if (creep.getTargetContainerEnergy('withdraw', 'in', true)) {
            return true;
        }
        if (creep.collectDroppedEnergy()) {
            return true;
        }
        //if (creep.getTargetContainerEnergy('withdraw')) {
        //    creep.memory.blockContainer = true;
        //    return true;
        //}
        
        return false;
    }
};

module.exports = roleHauler;
