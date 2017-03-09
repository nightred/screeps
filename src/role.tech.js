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
    role: 'tech',

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        'tower.fill',
        'repair',
        'construction',
        'signcontroller',
    ],

    /**
    * The locations that energy can be taken from
    **/
    energyTargets: [
        'storage',
        'containerOut',
        'container',
        'extention',
        'spawn',
    ],

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

        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) > Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (creep.memory.working) {
            if (!creep.memory.workId) {
                if (!creep.getWork(this.workTasks)) {
                    creep.memory.idleStart = Game.time;
                    creep.say('💤');

                    return true;
                }
            }

            if (!creep.doWork()) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + this.memory.role + ', name: ' + this.name); }
            }
        } else {
            if (!creep.doFillEnergy(this.energyTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + this.memory.role + ', name: ' + this.name); }
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
        let moveUnits = Math.floor((energy * 0.2) / 50);
        let carryUnits = Math.floor((energy * 0.3) / 50);
        let bodyParts = [];

        workUnits = workUnits < 1 ? 1 : workUnits;
        workUnits = workUnits > 5 ? 5 : workUnits;
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 6 ? 6 : moveUnits;
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 10 ? 10 : carryUnits;

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
        args.role = this.role;

        return spawn.createCreep(body, undefined, args);
    },

};

module.exports = roleTech;
