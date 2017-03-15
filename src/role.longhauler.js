/*
 * Long Hauler Role
 *
 * long hauler role that handles moving energy between rooms
 *
 */

var roleLongHauler = {

    /**
    * The role name
    **/
    role: 'longhauler',

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

        if (creep.getOffExit()) { return true; }
        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            if (!creep.isEnergyFull() && creep.collectDroppedEnergy()) {
                return true;;
            }
            creep.moveToIdlePosition();
            return true;
        }

        if (creep.memory.working) {
            if (creep.room.name != creep.memory.spawnRoom) {
                creep.moveToRoom(creep.memory.spawnRoom);
                return true;
            }

            if (!creep.doEmptyEnergy(this.energyOutTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (creep.room.name != creep.memory.workRooms[0]) {
                creep.moveToRoom(creep.memory.workRooms[0]);
                return true;
            }
            if (!creep.doFillEnergy(this.energyInTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
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

        let carryUnits = Math.floor((energy * 0.7) / 50);
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 24 ? 24 : carryUnits;
        energy -= carryUnits * 50
        let moveUnits = Math.floor(energy / 50);
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 12 ? 12 : moveUnits;
        let body = [];

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

module.exports = roleLongHauler;
