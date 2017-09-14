/*
 * role Combat Swarmer
 *
 * combat swarmer role defines an attach creep designed for
 * large number rapid combat
 *
 */

var roleCombatSwarmer = {

    /**
    * The role name
    **/
    role: C.ROLE_COMBAT_SWARMER,

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
                creep.say('🐝');
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

        let attackUnits = Math.floor((energy * 0.6) / 80);
        attackUnits = attackUnits < 1 ? 1 : attackUnits;
        attackUnits = attackUnits > 2 ? 2 : attackUnits;
        energy -= (attackUnits * 80);

        let moveUnits = Math.floor((energy * 0.7) / 50);
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 6 ? 6 : moveUnits;
        energy -= (moveUnits * 50);

        let toughUnits = Math.floor(energy / 10);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 4 ? 4 : toughUnits;
        toughUnits = toughUnits > (moveUnits + attackUnits) ? (moveUnits + attackUnits) : toughUnits;

        let body = [];
        for (let i = 0; i < toughUnits; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < attackUnits; i++) {
            body.push(ATTACK);
        }

        return body;
    },

};

module.exports = roleCombatSwarmer;
