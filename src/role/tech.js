/*
 * role Tech
 *
 * tech role defines the general server creep
 *
 */

var roleTech = {

    /**
    * The role name
    **/
    role: C.TECH,

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('⚙');
            } else {
                creep.say('🔋');
                creep.leaveWork();
            }
        }

        if (creep.getOffExit()) { return true; }
        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            if (!creep.isEnergyFull() && creep.collectDroppedEnergy()) {
                return true;;
            }
            creep.moveToIdlePosition();
            return true;
        }

        let workTasks = [
            C.REPAIR,
            C.TOWER_REFILL,
            C.CONSTRUCTION,
            C.SIGNCONTROLLER,
        ];

        let energyTargets = [
            'linkOut',
            'storage',
            'containerOut',
            'container',
            'containerIn',
        ];

        if (!creep.room.storage) {
            energyTargets.push('extention');
            energyTargets.push('spawn');
        }

        if (creep.memory.working) {
            if (!creep.memory.workId) {
                if (!creep.getWork(workTasks)) {
                    creep.memory.idleStart = Game.time;
                    creep.say('💤');

                    return true;
                }
            }

            if (!creep.doWork()) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (creep.memory.spawnRoom != creep.room.name) {
                creep.moveToRoom(creep.memory.spawnRoom);
                return true;
            }
            if (!creep.doFillEnergy(energyTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        }

        return true;
    },

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        let workUnits = Math.floor((energy * 0.5) / 100);
        workUnits = workUnits < 1 ? 1 : workUnits;
        workUnits = workUnits > 6 ? 6 : workUnits;
        energy -= 100 * workUnits;
        let moveUnits = Math.floor((energy * 0.5) / 50);
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 8 ? 8 : moveUnits;
        energy -= 50 * moveUnits;
        let carryUnits = Math.floor(energy / 50);
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 10 ? 10 : carryUnits;

        let body = [];
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }

        return body;
    },

    /**
    * Spawn the creep
    * @param {Spawn} spawn The spawn to be used
    * @param {array} body The creep body
    * @param {Object} args Extra arguments
    **/
    doSpawn: function(spawn, body, args) {
        if (!spawn) { return -1; }
        if (!Array.isArray(body) || body.length < 1) { return -1; }
        args = args || {};
        args.role = args.role || this.role;
        let name = Game.Queue.spawn.getCreepName(this.role);

        return spawn.createCreep(body, name, args);
    },

};

module.exports = roleTech;
