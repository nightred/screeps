/*
 * role Controller
 *
 * controller role is designed to clain or reserver room controllers.
 *
 */

var roleController = {

    /**
    * The role name
    **/
    role: C.CONTROLLER,

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        C.CLAIM,
        C.RESERVE,
    ],

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (!creep.memory.workId) {
            if (!creep.getWork(this.workTasks, { ignoreRoom: true, })) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                return true;
            } else {
                creep.say('🏴');
            }
        }

        if (!creep.doWork()) {
            if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
        }

        return true;
    },

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        args = args || {};

        args.style = args.style || 'default';
        let body = [];
        switch (args.style) {
            case C.RESERVE:
                energy -= 200;
                body = [MOVE,MOVE,MOVE,MOVE];
                let claim = Math.floor(energy / 600);
                claim = claim < 1 ? 1 : claim;
                claim = claim > 4 ? 4 : claim;
                for (let i = 0; i < claim; i++) {
                    body.push(CLAIM);
                }
                break;
            default:
                body = [MOVE,MOVE,MOVE,MOVE,CLAIM];
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
        args.role = this.role;

        return spawn.createCreep(body, undefined, args);
    },

};

module.exports = roleController;
