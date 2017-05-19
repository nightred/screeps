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
    role: C.HAULER,

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return -1; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚚');
            } else {
                creep.say('🔋');
            }
        } else if (creep.carry.energy > (creep.carryCapacity * 0.2) && !creep.memory.working)  {
            creep.toggleState();
            creep.say('🚚');
        }

        if (creep.getOffExit()) { return true; }
        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            if (!creep.isEnergyFull() && creep.collectDroppedEnergy()) {
                return true;;
            }
            creep.moveToIdlePosition();
            return true;
        }

        switch (creep.memory.style) {
            case 'longhauler':
                this.doLongHaul(creep);
                break;
            default:
                this.doHaul(creep);
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
        args.style = args.style || 'default';

        let move = 0;
        let carry = 0;
        let work = 0;
        switch (args.style) {
            case 'longhauler':
                energy -= 100;
                work = 1;
                move = Math.floor((energy * 0.4) / 50);
                move = move < 6 ? 6 : move;
                move = move > 13 ? 13 : move;
                energy -= move * 50
                carry = Math.floor(energy / 50);
                carry = carry < 10 ? 10 : carry;
                carry = carry > 24 ? 24 : carry;
                break;
            default:
                move = Math.floor((energy / 2) / 50);
                move = move < 1 ? 1 : move;
                move = move > 7 ? 7 : move;
                energy -= move * 50;
                carry = Math.floor(energy / 50);
                carry = carry < 1 ? 1 : carry;
                carry = carry > 14 ? 14 : carry;
        }

        let body = [];
        for (let i = 0; i < work; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < carry; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < move; i++) {
            body.push(MOVE);
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
        args.role = args.role || this.role;
        let name = Game.Queue.spawn.getCreepName(this.role);

        return spawn.createCreep(body, name, args);
    },

    doLongHaul: function(creep) {
        if (!creep) { return false; }

        if (Game.cpu.bucket < 500) { return true; }

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

    doHaul: function(creep) {
        if (!creep) { return false; }

        let energyInTargets =  [
            'containerIn',
        ];

        let energyOutTargets = [
            'spawn',
            'storage',
        ];

        if (!creep.room.storage) {
            energyOutTargets = [
                'extention',
                'spawn',
                'containerOut',
                'container',
            ];
        }

        // working has energy, else need energy
        if (creep.memory.working) {
            if (!creep.doEmptyEnergy(energyOutTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (!creep.doFillEnergy(energyInTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        }

        return true;
    },

};

module.exports = roleHauler;
