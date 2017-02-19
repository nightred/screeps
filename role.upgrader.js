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
                creep.say('📡');
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
        
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    
    /** @param {Creep} creep **/
    doRecharge: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            if (!this.getRechargeLocation(creep)) {
                if (!creep.isCarryingEnergy()) {
                    creep.memory.idleStart = Game.time;
                    creep.say('💤');
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
        if (!creep) { return false; }
        
        let targets = [];
        let getTargets = creep.getTargetContainerEnergy('withdraw', 'out');
        if (getTargets.length > 0) {
            getTargets.forEach(structure => targets.push(structure));
        }
        getTargets = creep.getTargetContainerEnergy('withdraw');
        if (getTargets.length > 0) {
            getTargets.forEach(structure => targets.push(structure));
        }
        getTargets = creep.getTargetContainerEnergy('withdraw', 'in');
        if (getTargets.length > 0) {
            getTargets.forEach(structure => targets.push(structure));
        }

        if (creep.room.getContainers().length == 0) {
            getTargets = creep.getTargetExtentionEnergy('withdraw');
            if (getTargets.length > 0) {
                getTargets.forEach(structure => targets.push(structure));
            }
        }
        if (creep.room.getExtensions().length == 0) {
            let spawn = creep.getTargetSpawnEnergy('store');
            if (spawn) { return creep.setGoingTo(spawn); }
        }
        
        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));

        return creep.setGoingTo(targets[0]);
    }
};

module.exports = roleUpgrader;
