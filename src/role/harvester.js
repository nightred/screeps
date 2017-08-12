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
            creep.doWork();
        } else {
            let emptyTargets = [
                'containerIn',
                'storage',
            ];
            let mineral = Game.getObjectById(creep.memory.mineralId);
            if (!creep.memory.goingTo && mineral) {
                creep.memory.goingTo = mineral.getLocalContainer();
            }

            creep.doEmptyMineral(emptyTargets);
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

};

module.exports = roleHarvester;
