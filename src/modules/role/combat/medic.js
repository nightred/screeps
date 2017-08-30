/*
 * role Combat Medic
 *
 * combat medic role defines a healer that provides support to combat creeps
 *
 */

var roleCombatMedic = {

    /**
    * The role name
    **/
    role: C.ROLE_COMBAT_MEDIC,

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

        let workTasks = [ C.WORK_ATTACK, ];

        if (!creep.memory.workId) {
            if (!creep.getWork(workTasks, {ignoreRoom: true})) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                return true;
            } else {
                creep.say('⚕️');
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
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }
        args = args || {};

        let healUnits = Math.floor((energy * 0.6) / 80);
        healUnits = healUnits < 1 ? 1 : healUnits;
        healUnits = healUnits > 2 ? 2 : healUnits;
        energy -= (healUnits * 80);

        let moveUnits = Math.floor((energy * 0.7) / 50);
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 6 ? 6 : moveUnits;
        energy -= (moveUnits * 50);

        let toughUnits = Math.floor(energy / 10);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 4 ? 4 : toughUnits;
        toughUnits = toughUnits > (moveUnits + healUnits) ? (moveUnits + healUnits) : toughUnits;

        let body = [];
        for (let i = 0; i < toughUnits; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < healUnits; i++) {
            body.push(HEAL);
        }

        return body;
    },

};

module.exports = roleCombatMedic;
