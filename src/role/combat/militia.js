/*
 * role Combat Militia
 *
 * combat militia role defines an militia creep for
 * room and remote area defense
 *
 */

var roleCombatMilitia = {

    /**
    * The role name
    **/
    role: C.COMBAT_MILITIA,

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (creep.getOffExit()) { return true; }

        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        let workTasks = [ C.DEFENSE, ];

        if (!creep.memory.workId) {
            if (!creep.getWork(workTasks, {ignoreRoom: true})) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                return true;
            } else {
                creep.say('👊');
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
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }
        args = args || {};

        let moveUnits = 0;
        let attackUnits = Math.floor(energy / 105);
        attackUnits = attackUnits < 1 ? 1 : attackUnits;
        attackUnits = attackUnits > 10 ? 10 : attackUnits;

        energy -= (attackUnits * 105);
        moveUnits += math.ceil(attackUnits / 2);

        let healUnits = Math.floor(energy / 275);
        healUnits = healUnits < 0 ? 0 : healUnits;
        healUnits = healUnits > 2 ? 2 : healUnits;

        energy -= (healUnits * 275);
        moveUnits += math.ceil(healUnits / 2);

        let toughUnits = Math.floor(energy / 35);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 16 ? 16 : toughUnits;

        moveUnits += math.ceil(toughUnits / 2);

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
        for (let i = 0; i < healUnits; i++) {
            body.push(HEAL);
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

module.exports = roleCombatMilitia;
