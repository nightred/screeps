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
    
    getBody: function(energy) {
        let workUnits = Math.floor((energy * 0.5) / 100);  // 100
        let moveUnits = Math.floor((energy * 0.3) / 50);  // 50
        let carryUnits = Math.floor((energy * 0.2) / 50); // 50
        let bodyParts = [];
        
        workUnits = workUnits < 1 ? 1 : workUnits;
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
    
        workUnits = workUnits > 8 ? 8 : workUnits;
        moveUnits = moveUnits > 10 ? 10 : moveUnits;
        carryUnits = carryUnits > 6 ? 6 : carryUnits;
        
        for (let i = 0; i < workUnits; i++) {
            bodyParts.push(WORK);
        }
        for (let i = 0; i < moveUnits; i++) {
            bodyParts.push(MOVE);
        }
        for (let i = 0; i < carryUnits; i++) { 
            bodyParts.push(CARRY);
        }
        
        return bodyParts;
    },
    
    doSpawn: function(spawn, body) {
        if (!spawn) { return false; }
        if (!body || body.length < 1) { return false; }

        return spawn.createCreep(body, undefined, {role: 'service'});
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
        let storage = creep.getTargetStorageEnergy('withdraw');
        if (storage) {
            targets.push(storage);
        }

        if (targets.length < 1 && creep.room.getContainers().length <= 2) {
            getTargets = creep.getTargetExtentionEnergy('withdraw');
            if (getTargets.length > 0) {
                getTargets.forEach(structure => targets.push(structure));
            }
        }
        if (creep.room.getExtensions().length < 5) {
            let spawns = creep.getTargetSpawnEnergy('withdraw');
            if (spawns.length > 0) {
                spawns = _.sortBy(spawns, structure => creep.pos.getRangeTo(structure));
                
                return creep.setGoingTo(spawns[0]);
            }
        }
        
        if (targets.length == 0 || !targets) { return false; }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));

        return creep.setGoingTo(targets[0]);
    },
};

module.exports = roleService;
