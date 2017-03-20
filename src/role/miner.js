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
    role: 'miner',

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        'mine',
    ],

    /**
    * The locations that energy can be stored
    **/
    energyTargets: [
        'containerIn',
        'spawn',
        'extention',
        'container',
        'containerOut',
        'storage',
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

        if (!creep.memory.working) {
            if (!creep.doWork()) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            let source = Game.getObjectById(creep.memory.harvestTarget);
            if (!creep.memory.goingTo && source) {
                creep.memory.goingTo = source.getLocalContainer();
            }

            if (!creep.doEmptyEnergy(this.energyTargets)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
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
        if (!args.style) { args.style = 'default'; }

        let body = [];
        let workUnits = 1;
        let moveUnits = 1;
        let carryUnits = 1;
        let extrasCost = 0;
        switch (args.style) {
            case 'drop':
                break;
            case 'ranged':
                energy -= 50;
                body.push(CARRY);
                workUnits = Math.floor((energy * 0.8) / 100);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 6 ? 6 : workUnits;
                energy -= (100 * workUnits);

                let moveUnits = Math.floor(energy / 50);
                moveUnits = moveUnits < 1 ? 1 : moveUnits;
                moveUnits = moveUnits > 4 ? 4 : moveUnits;

                for (let i = 0; i < moveUnits; i++) {
                    body.push(MOVE);
                }
                for (let i = 0; i < workUnits; i++) {
                    body.push(WORK);
                }
                break;
            default:
                extrasCost = 100;
                body.push(MOVE);
                body.push(CARRY);
                workUnits = Math.floor((energy - extrasCost) / 100);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 6 ? 6 : workUnits;
                for (let i = 0; i < workUnits; i++) {
                    body.push(WORK);
                }
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

module.exports = roleMiner;
