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
                creep.memory.withdrawId = false;
                creep.memory.storeId = false;
            }
        }
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        if (!creep.memory.withdrawId || !creep.memory.storeId) {
            creep.memory.withdrawId = false;
            creep.memory.storeId = false;
            if (!this.getEnergyMove(creep)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                
                return false;
            }
        }
        
        if (creep.memory.working) {
            this.doStoreEnergy(creep, creep.memory.storeId);
        } else {
            this.doWithdrawEnergy(creep, creep.memory.withdrawId);
        }
        
        return true;
    },
    
    /** @param {Creep} creep **/
    getEnergyMove: function(creep) {
        if (!creep) { return false; }
        
        if (this.doEmptyInContainers(creep)) { return true; }
        if (this.doFillSpawn(creep)) { return true; }
        if (this.doFillOutContainers(creep)) { return true; }
        
        return false;
    },
    
    /** @param {Creep} creep **/
    doEmptyInContainers: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.storeId) {
            let targetId = this.getStoreEnergyDefaultId(creep);
            if (!targetId) { return false; }
            creep.memory.storeId = targetId;
        }
        
        if (!creep.memory.withdrawId) {
            let targetId = this.getWithdrawEnergyContainerInId(creep);
            if (!targetId) { 
                creep.memory.storeId = false;
                return false;
            }
            creep.memory.withdrawId = targetId;
        }
        
        return true;
    },
    
    /** @param {Creep} creep **/
    doFillSpawn: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.storeId) {
            let targetId = this.getStoreEnergySpawnId(creep);
            if (!targetId) { return false; }
            creep.memory.storeId = targetId;
        }
        
        if (!creep.memory.withdrawId) {
            let targetId = this.getWithdrawEnergyForFillId(creep);
            if (!targetId) { 
                creep.memory.storeId = false;
                return false;
            }
            creep.memory.withdrawId = targetId;
        }
        
        return true;
    },
    
    /** @param {Creep} creep **/
    doFillOutContainers: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.storeId) {
            let targetId = this.getStoreEnergyContainerOutId(creep);
            if (!targetId) { return false; }
            creep.memory.storeId = targetId;
        }
        
        if (!creep.memory.withdrawId) {
            let targetId = this.getWithdrawEnergyForFillId(creep);
            if (!targetId) { 
                creep.memory.storeId = false;
                return false;
            }
            creep.memory.withdrawId = targetId;
        }
        
        return true;
    },
    
    /** @param {Creep} creep **/
    doWithdrawEnergy: function(creep, targetId) {
        if (!creep) { return false; }
        if (!targetId) { return false; }
        
        let target = Game.getObjectById(targetId);
        if (!target) { return false; }
        
        if (creep.withdrawEnergy(target)) {
            if (creep.carry.energy > 0) {
                creep.toggleState();
                
                return true;
            }
        }
        
        return true;
    },
    
    /** @param {Creep} creep **/
    doStoreEnergy: function(creep, targetId) {
        if (!creep) { return false; }
        if (!targetId) { return false; }
        
        let target = Game.getObjectById(targetId);
        if (!target) { return false; }
        
        if (creep.transferEnergy(target)) {
            creep.memory.withdrawId = false;
            creep.memory.storeId = false;
        }
        
        return true; 
    },
    
    /** @param {Creep} creep **/
    getStoreEnergyDefaultId: function(creep) {
        if (!creep) { return false; }
        
        let targets = [];
        let spawn = creep.getTargetSpawnEnergy('store');
        if (spawn) { return spawn.id; }
        
        targets = creep.getTargetExtentionEnergy('store');
        if (targets.length > 0) {
            targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
            
            return targets[0].id;
        }
        
        let getTargets = creep.getTargetContainerEnergy('store', 'out', true);
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
        
        return targets[0].id;
    },
    
    /** @param {Creep} creep **/
    getStoreEnergySpawnId: function(creep) {
        if (!creep) { return false; }
        
        let targets = [];
        let spawn = creep.getTargetSpawnEnergy('store');
        if (spawn) { return spawn.id; }
        
        targets = creep.getTargetExtentionEnergy('store');
        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return targets[0].id;
    },
    
    /** @param {Creep} creep **/
    getStoreEnergyContainerOutId: function(creep) {
        if (!creep) { return false; }
        
        let targets = creep.getTargetContainerEnergy('store', 'out')
        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return targets[0].id;
    },
    
    /** @param {Creep} creep **/
    getWithdrawEnergyContainerInId: function(creep) {
        if (!creep) { return false; }
        
        let targets = creep.getTargetContainerEnergy('withdraw', 'in', true)
        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return targets[0].id;
    },
    
    /** @param {Creep} creep **/
    getWithdrawEnergyForFillId: function(creep) {
        if (!creep) { return false; }
        
        let targets = [];
        let getTargets = creep.getTargetContainerEnergy('withdraw');
        if (getTargets.length > 0) {
            getTargets.forEach(structure => targets.push(structure));
        }
        let storage = creep.getTargetStorageEnergy('withdraw');
        if (storage) {
            targets.push(storage);
        }
        
        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return targets[0].id;
    },
    
    /** @param {Creep} creep **/
    collectDroppedEnergy: function(creep) {
        if (!creep) { return false; }
        
        return creep.collectDroppedEnergy();
    },
    
};

module.exports = roleHauler;
