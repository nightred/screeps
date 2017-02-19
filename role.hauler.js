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
                creep.say('🚚');
            } else {
                creep.say('🔋');
            }
        }
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        if (creep.memory.working) {
            this.doStoreEnergy(creep);
        } else {
            this.doWithdrawEnergy(creep);
        }
    },
    
    /** @param {Creep} creep **/
    doStoreEnergy: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            if (!this.getStoreEnergyLocation(creep)) {
                creep.memory.idleStart = Game.time;
                
                return false;
            }
        }
        
        let target = Game.getObjectById(creep.memory.goingTo);
        creep.transferEnergy(target);
        
        return true; 
    },
    
    /** @param {Creep} creep **/
    getStoreEnergyLocation: function(creep) {
        
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
    
    /** @param {Creep} creep **/
    doWithdrawEnergy: function(creep) {
        if (creep.carry.energy > 0) {
            creep.toggleState();
            
            return true;
        }
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            if (!this.getWithdrawEnergyLocation(creep)) {
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
    },
    
    /** @param {Creep} creep **/
    getWithdrawEnergyLocation: function(creep) {
        
        if (creep.getTargetContainerEnergy('withdraw', 'in', true)) {
            return true;
        }
        if (creep.collectDroppedEnergy()) {
            return true;
        }
        
        return false;
    },
};

module.exports = roleHauler;
