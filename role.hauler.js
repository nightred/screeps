/*
 * Role Hauler
 *
 * hauler role handles moving energy to needed locations
 *
 */

var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep) { return false; }
        
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
                creep.say('💤');
                
                return false;
            }
        }
        
        let target = Game.getObjectById(creep.memory.goingTo);
        creep.transferEnergy(target);
        
        return true; 
    },
    
    /** @param {Creep} creep **/
    getStoreEnergyLocation: function(creep) {
        if (!creep) { return false; }
        
        let targets = [];
        let spawn = creep.getTargetSpawnEnergy('store');
        if (spawn) { return creep.setGoingTo(spawn); }
        let getTargets = creep.getTargetExtentionEnergy('store');
        if (getTargets.length > 0) {
            getTargets.forEach(structure => targets.push(structure));
        }
        getTargets = creep.getTargetContainerEnergy('store', 'out', true);
        if (getTargets.length > 0) {
            getTargets.forEach(structure => targets.push(structure));
        }
        if (!creep.memory.blockContainer) {
            getTargets = creep.getTargetContainerEnergy('store');
            if (getTargets.length > 0) {
                getTargets.forEach(structure => targets.push(structure));
            }
            let storage = creep.getTargetStorageEnergy('store');
            if (storage) {
                targets.push(storage);
            }
            
        }
        
        if (targets.length == 0) { return false; }
        
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return creep.setGoingTo(targets[0]);
    },
    
    /** @param {Creep} creep **/
    doWithdrawEnergy: function(creep) {
        if (!creep) { return false; }
        if (creep.carry.energy > 0) {
            creep.toggleState();
            
            return true;
        }
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            if (!this.getWithdrawEnergyLocation(creep)) {
                if (!creep.isCarryingEnergy()) {
                    if (!this.collectDroppedEnergy(creep)) {
                        creep.memory.idleStart = Game.time;
                        creep.say('💤');
                    }
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
        if (!creep) { return false; }
        
        let targets = creep.getTargetContainerEnergy('withdraw', 'in', true)
        
        if (targets.length == 0) { return false; }
        
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return creep.setGoingTo(targets[0]);
    },
    
    /** @param {Creep} creep **/
    collectDroppedEnergy: function(creep) {
        if (!creep) { return false; }
        
        return creep.collectDroppedEnergy();
    },
    
};

module.exports = roleHauler;
