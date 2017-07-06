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
        C.WORK_CLAIM,
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
            case 'reserve':
                let claim = Math.floor(energy / 650);
                claim = claim < 1 ? 1 : claim;
                claim = claim > 5 ? 5 : claim;
                for (let i = 0; i < claim; i++) {
                    body.push(CLAIM);
                    body.push(MOVE);
                }
                break;
            default:
                body = [MOVE,CLAIM];
        }

        return body;
    },

};

module.exports = roleController;
