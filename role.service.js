/*
 * Role Service
 *
 * service role handles work operations and mantinance
 *
 */

var roleService = {
    
    workTypes: [
        'refillTower',
        'repair',
        'build',
        ],

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('⚙');
            } else {
                creep.say('🔋');
            }
        }
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        if (creep.memory.working) {
            this.doWork(creep);
        } else {
            this.doRecharge(creep);
        }
    },
    
    /** @param {Creep} creep **/
    doWork: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.workId) {
            if (!creep.getWork(this.workTypes)) {
                creep.memory.idleStart = Game.time;
                
                return false;
            }
        }
        
        if (!creep.doWork()) {
            if (Constant.DEBUG) { console.log("DEBUG - " + this.memory.role + " " + this.name + ' failed doWork'); }
        }
        
        return true;
    },
    
    /** @param {Creep} creep **/
    doRecharge: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            if (!this.getRechargeLocation(creep)) {
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
    getRechargeLocation: function(creep) {
        
        if (creep.getTargetStorageEnergy('withdraw')) {
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw', 'out', false)) {
            return true;
        }
        if (creep.getTargetContainerEnergy('withdraw')) {
            creep.memory.blockContainer = true;
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
    },
};

module.exports = roleService;
