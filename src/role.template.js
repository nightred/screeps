/*
 * role Template
 *
 * template role defines the basic layout of a role
 *
 */

var roleTemplate = {

    /**
    * The role name
    **/
    role: 'template',

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        'template',
    ],

    /**
    * The locations that energy can be taken from
    **/
    refillEnergy: [
        'spawn',
        'extention',
        'container',
        'storage',
    ],

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('⛏️');
            } else {
                creep.say('🔋');
            }
        }

        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) < Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (!creep.memory.working) {
            if (!creep.memory.workId) {
                if (!creep.getWork(this.workTypes)) {
                    creep.memory.idleStart = Game.time;
                    creep.say('💤');

                    return true;
                }
            }

            if (!creep.doWork()) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + this.memory.role + ', name: ' + this.name); }
            }
        } else {
            if (!creep.doRefillEnergy(this.refillEnergy)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do restock failed for role: ' + this.memory.role + ', name: ' + this.name); }
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
        let body = [];

        body.push(WORK);
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
        if (!Array.isArray(body)) { return -1; }
        args = args || {};
        args.role = this.role;

        return spawn.createCreep(body, undefined, args);
    },

};

module.exports = roleTemplate;
