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
                creep.say('💤');
                
                return false;
            }
        }
        
        if (!creep.doWork()) {
            if (Constant.DEBUG >= 2) { console.log("DEBUG - " + this.memory.role + " " + this.name + ' failed doWork'); }
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
        let storage = creep.getTargetStorageEnergy('store');
        if (storage) {
            targets.push(storage);
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
    },
};

module.exports = roleService;
