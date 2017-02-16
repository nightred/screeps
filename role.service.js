/*
 * Role Service
 *
 * service role handles work operations and mantinance
 *
 */

var roleService = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('⚙ service');
            } else {
                creep.memory.serviceJob = false;
                creep.say('🔋 energy');
            }
        }
        
        if (creep.memory.working) {
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleService.getWork(creep)) {
                    creep.moveToIdlePosition();
                    
                    return false;
                }
            }
            
            if (!roleService.doWork(creep)) {
                creep.moveToIdlePosition();
                
                return false;
            }
            
            return true;
        }
        else {
            
            if (creep.carry.energy > 0) {
                creep.toggleState();
                
                return true;
            }
            if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
                if (!roleService.withdrawEnergy(creep)) {
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
    doWork: function(creep) {
        
        if (creep.memory.serviceJob == 'tower') {
            let target = Game.getObjectById(creep.memory.goingTo);
            creep.transferEnergy(target);
            
            return true;
        }
        
        return false;
    },
    
    /** @param {Creep} creep **/
    getWork: function(creep) {
        
        if (creep.getTargetTowerEnergy('store')) {
            creep.memory.serviceJob = 'tower';
            return true;
        }
        
        return false;
    },
    
    /** @param {Creep} creep **/
    withdrawEnergy: function(creep) {
        
        if (creep.getTargetStorageEnergy('withdraw')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw')) {
            creep.memory.blockContainer = true;
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw', 'out', false)) {
            return true;
        }
        
        return false;
    },
};

module.exports = roleService;