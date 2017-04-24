/*
 * Linker Role
 *
 * miner role that handles moving energy in a room
 *
 */

var roleLinker = {

    /**
    * The role name
    **/
    role: C.LINKER,

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return -1; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🔗');
            } else {
                creep.say('🔋');
                creep.memory.task = false;
            }
        } else if (creep.carry.energy > (creep.carryCapacity * 0.2) && !creep.memory.working)  {
            creep.toggleState();
            creep.say('🔗');
        }

        if (!creep.memory.task) {
            if (!this.getTask(creep))  {
                return true;
            }
        }

        let energyInTargets = [];
        let energyOutTargets = [];

        switch (creep.memory.task) {
            case 'store':
                energyInTargets = ['linkStorage',];
                energyOutTargets = ['storage',];
                break;
            case 'fill':
                energyOutTargets = ['linkStorage',];
                energyInTargets = ['storage',];
                break;
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
        if (creep.memory.idleStart && creep.memory.idleStart == Game.time) {
            creep.memory.task = false;
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
        move = move > 3 ? 3 : move;
        energy -= move * 50;
        let carry = Math.floor(energy / 50);
        carry = carry < 1 ? 1 : carry;
        carry = carry > 6 ? 6 : carry;

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
        args.role = args.role || this.role;
        let name = Game.Queue.spawn.getCreepName(this.role);

        return spawn.createCreep(body, name, args);
    },

    getTask: function(creep) {
        if (!creep) { return -1; }
        let room = creep.room;

        if (!room.storage) { return false }

        let linksStorage = _.filter(room.getLinks(), structure =>
            structure.memory.type == 'storage');
        if (linksStorage.length <= 0) { return false; }
        let linkStorage = linksStorage[0];

        if (linkStorage.energy > (linkStorage.energyCapacity * C.ENERGY_LINK_STORAGE_MAX)) {
            creep.memory.task = 'store';
            return true;
        }

        if (linkStorage.energy < (linkStorage.energyCapacity * C.ENERGY_LINK_STORAGE_MIN)) {
            creep.memory.task = 'fill';
            return true;
        }

        return false;
    },

};

module.exports = roleLinker;
