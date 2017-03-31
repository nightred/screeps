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

        let energyOutTargets = [
            'storage',
            'spawn',
            'extention',
        ];
        let energyInTargets = [
            'containerIn',
        ];
        if (!creep.room.storage) {
            energyOutTargets.push('containerOut');
            energyOutTargets.push('container');
        }

        if (creep.memory.working) {

            if (creep.isOnRoad()) {
                let road = creep.getOnRoad();
                if (road.hits < road.hitsMax) {
                    creep.repair(road);
                }
            }

            if (creep.room.name != creep.memory.spawnRoom) {
                creep.moveToRoom(creep.memory.spawnRoom);
                return true;
            }

            if (!creep.doEmptyEnergy(energyOutTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (creep.room.name != creep.memory.workRooms[0]) {
                creep.moveToRoom(creep.memory.workRooms[0]);
                return true;
            }
            if (!creep.doFillEnergy(energyInTargets)) {
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

        energy -= 100;
        let moveUnits = Math.floor((energy * 0.4) / 50);
        moveUnits = moveUnits < 6 ? 6 : moveUnits;
        moveUnits = moveUnits > 13 ? 13 : moveUnits;
        energy -= moveUnits * 50
        let carryUnits = Math.floor( / 50);
        carryUnits = carryUnits < 10 ? 10 : carryUnits;
        carryUnits = carryUnits > 24 ? 24 : carryUnits;

        let body = [];
        body.push(WORK);
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
