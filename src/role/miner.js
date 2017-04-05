/*
 * Miner Role
 *
 * miner role that handles energy mining
 *
 */

var roleMiner = {

    /**
    * The role name
    **/
    role: C.MINER,

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        C.MINE,
    ],

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('⛏️');
            } else {
                creep.say('⚡');
            }
        }

        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (!creep.memory.workId) {
            if (!creep.getWork(this.workTasks)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');

                return true;
            }
        }


        switch (creep.memory.style) {
            case 'drop':
                this.doDropHarvest(creep);
                break;
            default:
                this.doHarvest(creep);
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
        if (!args.style) { args.style = 'default'; }

        let body = [];
        let workUnits = 1;
        let moveUnits = 1;
        let carryUnits = 1;
        let extrasCost = 0;
        switch (args.style) {
            case 'drop':
                energy -= 50;
                moveUnits = 1;

                workUnits = Math.floor(energy / 100);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 6 ? 6 : workUnits;
                break;
            case 'ranged':
                energy -= 50;
                body.push(CARRY);

                workUnits = Math.floor((energy * 0.8) / 100);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 6 ? 6 : workUnits;
                energy -= (100 * workUnits);

                moveUnits = Math.floor(energy / 50);
                moveUnits = moveUnits < 1 ? 1 : moveUnits;
                moveUnits = moveUnits > 4 ? 4 : moveUnits;
                break;
            default:
                energy -= 100;
                moveUnits = 1;
                body.push(CARRY);

                workUnits = Math.floor(energy / 100);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 6 ? 6 : workUnits;
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
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

    doHarvest: function(creep) {
        if (!creep) { return -1; }

        let energyTargets = [
            'linkIn',
            'containerIn',
            'spawn',
            'extention',
            'container',
            'containerOut',
            'storage',
        ];

        if (!creep.memory.working) {
            if (!creep.doWork()) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            let source = Game.getObjectById(creep.memory.harvestTarget);
            if (!creep.memory.goingTo && source) {
                creep.memory.goingTo = source.getLocalContainer();
            }

            if (!creep.doEmptyEnergy(energyTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        }

        return true;
    },

    doDropHarvest: function(creep) {
        if (!creep) { return -1; }
        let source = Game.getObjectById(creep.memory.harvestTarget);
        let target = Game.getObjectById(source.getDropContainer());

        if (!target) {
            if (Constant.DEBUG >= 3) { console.log('VERBOSE - harvester ' + creep.name + ' has no drop container'); }
            source.clearContainer();
            creep.setDespawn();

            return false;
        }

        if (!creep.memory.atSource) {
            if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
                creep.memory.atSource = true;
            } else {
                creep.moveTo(target.pos.x, target.pos.y, { range: 1, reUsePath: 80, maxOps: 4000, ignoreCreeps: true, });
                return true;
            }
        }

        if (_.sum(target.store) >= (target.storeCapacity * C.ENERGY_CONTAINER_MAX_PERCENT)) {
            return true;
        }

        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - harvester ' + creep.name + ' not in range of ' + source.id); }
            return false;
        }

        return true;
    },

};

module.exports = roleMiner;
