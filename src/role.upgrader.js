/*
 * role Upgrader
 *
 * template role defines the basic layout of a role
 *
 */

var roleUpgrader = {

    /**
    * The role name
    **/
    role: 'upgrader',

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        'upgrade',
    ],

    /**
    * The locations that energy can be taken from
    **/
    energyTargets: [
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
                creep.say('📡');
            } else {
                creep.say('🔋');
            }
        }

        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) > Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (!creep.memory.workId) {
            if (!creep.getWork(this.workTasks)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');

                return true;
            }
        }

        if (creep.memory.working) {
            if (!creep.doWork()) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (!creep.doFillEnergy(this.energyTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
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
        let workUnits = Math.floor((energy - 100) / 100);
        let body = [];

        workUnits = workUnits < 1 ? 1 : workUnits;
        workUnits = workUnits > 5 ? 5 : workUnits;
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }

        body.push(MOVE);
        body.push(CARRY);

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
        args.role = this.role;

        return spawn.createCreep(body, undefined, args);
    },

};

module.exports = roleUpgrader;
