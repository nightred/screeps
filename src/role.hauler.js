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
        'storage',
        'spawn',
        'extention',
        'containerOut',
        'container',
    ],

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return -1; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚚');
            } else {
                creep.say('🔋');
                creep.memory.task = false;
            }
        } else if (creep.carry.energy > (creep.carryCapacity * 0.2) && !creep.memory.working)  {
            creep.toggleState();
            creep.say('🚚');
        }

        if (creep.memory.task &&
            (creep.memory.idleStart + Constant.CREEP_IDLE_TIME) > Game.time) {
            creep.memory.task = false;
            creep.memory.idleStart = 0;
        }
        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) > Game.time) {
            if (!creep.isEnergyFull() && creep.collectDroppedEnergy()) {
                return true;;
            }
            creep.moveToIdlePosition();
            return true;
        }

        // working has energy, else need energy
        if (creep.memory.working) {
            if (!creep.doEmptyEnergy(this.energyOutTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (!creep.doFillEnergy(this.energyInTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
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

        let move = Math.floor((energy / 2) / 50);
        move = move < 1 ? 1 : move;
        move = move > 5 ? 5 : move;
        energy -= move * 50;
        let carry = Math.floor(energy / 50);
        carry = carry < 1 ? 1 : carry;
        carry = carry > 10 ? 10 : carry;

        let body = [];
        for (let i = 0; i < move; i++) {
            body.push(MOVE);
        }

        for (let i = 0; i < carry; i++) {
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
