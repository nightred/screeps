/*
 * role Scout
 *
 * scout role defines a movment only long range expendable creep
 *
 */

var roleScout = {

    /**
    * The role name
    **/
    role: C.SCOUT,

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        C.WORK_SCOUTING
    ],

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.getOffExit()) { return true; }
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
                creep.say('🚴');
            }
        }

        creep.doWork();

        return true;
    },

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        let body = [MOVE];

        return body;
    },

};

module.exports = roleScout;
