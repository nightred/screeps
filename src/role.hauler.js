/*
 * Hauler Role
 *
 * miner role that handles moving energy in a room
 *
 */

var roleHauler = {

    /**
    * The role name
    **/
    role: 'hauler',

    /**
    * The locations that energy can be withdrawn
    **/
    energyInTargets: [
        'containerIn',
    ],
    /**
    * The locations that energy can be stored
    **/
    energyOutTargets: [
        'spawn',
        'extention',
        'containerOut',
        'container',
        'storage',
    ],

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚚');
            } else {
                creep.say('🔋');
            }
        }

        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) > Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (creep.memory.working) {
            if (!creep.doEmptyEnergy(this.energyOutTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + this.memory.role + ', name: ' + this.name); }
            }
        } else {
            if (!creep.doFillEnergy(this.energyInTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + this.memory.role + ', name: ' + this.name); }
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
        if (isNaN(energy)) { return -1; }
        args = args || {};

        let carryUnits = Math.floor((energy / 2) / 50);
        let moveUnits = Math.floor((energy / 2) / 50);
        let body = [];

        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 4 ? 4 : moveUnits;
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 8 ? 8 : carryUnits;

        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
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

module.exports = roleHauler;
