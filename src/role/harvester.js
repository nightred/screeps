/*
 * Harvester Role
 *
 * harvester role that handles harvesting minerals
 *
 */

var roleHarvester = {

    /**
    * The role name
    **/
    role: C.HARVESTER,

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        C.HARVEST,
    ],

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('💎');
            } else {
                creep.say('⚡');
            }
        }

        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
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

        if (!creep.memory.working || creep.memory.style == 'drop') {
            if (!creep.doWork()) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            let emptyTargets = [
                'containerIn',
                'storage',
            ];
            let mineral = Game.getObjectById(creep.memory.mineralId);
            if (!creep.memory.goingTo && mineral) {
                creep.memory.goingTo = mineral.getLocalContainer();
            }

            if (!creep.doEmptyMineral(emptyTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
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
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }
        args = args || {};
        if (!args.style) { args.style = 'default'; }

        let body = [];
        let workUnits = 1;
        let moveUnits = 1;
        let carryUnits = 1;
        let extrasCost = 0;

        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
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
        if (!spawn) { return ERR_INVALID_ARGS; }
        if (!Array.isArray(body) || body.length < 1) { return ERR_INVALID_ARGS; }
        args = args || {};
        args.role = args.role || this.role;
        let name = Game.Queue.spawn.getCreepName(this.role);

        return spawn.createCreep(body, name, args);
    },

};

module.exports = roleHarvester;
