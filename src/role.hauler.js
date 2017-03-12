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
            creep.moveToIdlePosition();
            return true;
        }

        this.doWork(creep);

        return true;
    },

    /** @param {Creep} creep **/
    doWork: function(creep) {
        if (!creep) { return -1; }
        creep.memory.task = creep.memory.task || false;

        if (!creep.memory.task) {
            if (creep.room.storage &&
                creep.room.storage.store[RESOURCE_ENERGY] > 100 &&
                creep.getEmptyEnergyTarget(['spawn','extention',],{noSet: true,})) {
                creep.memory.task = 'fillSpawn';
            } else {
                creep.memory.task = 'default';
            }
        }

        let outTargets = this.energyOutTargets;
        let inTargets = this.energyInTargets;
        if (creep.memory.task == 'fillSpawn') {
            outTargets = ['spawn','extention',];
            inTargets = ['storage',];
        }

        // working has energy, else need energy
        if (creep.memory.working) {
            if (!creep.doEmptyEnergy(outTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (!creep.doFillEnergy(inTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        }
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
