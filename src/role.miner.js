/*
 * Miner Role
 *
 * miner role that handles energy mining
 *
 */

var roleRemoteHarvester = {

    /**
    * The role name
    **/
    role: 'miner',

    /**
    * The work tasks that the role is created for
    **/
    workTypes: [
        'mine',
    ],

    /**
    * The locations that energy can be stored
    **/
    energyTargets: [
        'spawn',
        'extention',
        'container',
        'storage',
    ],

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('⛏️');
            } else {
                creep.say('🔋');
            }
        }

        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) < Game.time) {
            creep.moveToIdlePosition();
            return true;
        }

        if (!creep.memory.working) {
            if (!creep.memory.workId) {
                if (!creep.getWork(this.workTypes)) {
                    creep.memory.idleStart = Game.time;
                    creep.say('💤');

                    return true;
                }
            }

            if (!creep.doWork()) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + this.memory.role + ', name: ' + this.name); }
            }
        } else {
            if (!creep.doEmptyEnergy(this.energyTargets)) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + this.memory.role + ', name: ' + this.name); }
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

        let bodyParts = [];
        switch (args.style) {
            case 'drop':
                break;
            case 'ranged':
                let workUnits = Math.floor((energy * 0.5) / 100);
                let moveUnits = Math.floor((energy * 0.3) / 50);
                let carryUnits = Math.floor((energy * 0.2) / 50);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 5 ? 5 : workUnits;
                moveUnits = moveUnits < 1 ? 1 : moveUnits;
                moveUnits = moveUnits > 15 ? 15 : moveUnits;
                carryUnits = carryUnits < 1 ? 1 : carryUnits;
                carryUnits = carryUnits > 24 ? 24 : carryUnits;
                for (let i = 0; i < workUnits; i++) {
                    bodyParts.push(WORK);
                }
                for (let i = 0; i < moveUnits; i++) {
                    bodyParts.push(MOVE);
                }
                for (let i = 0; i < carryUnits; i++) {
                    bodyParts.push(CARRY);
                }
                break;
            default:
                let extrasCost = 100;
                bodyParts.push(MOVE);
                bodyParts.push(CARRY);
                let workUnits = Math.floor((energy - extrasCost) / 100);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 5 ? 5 : workUnits;
                for (let i = 0; i < workUnits; i++) {
                    bodyParts.push(WORK);
                }
        }

        return bodyParts;
    },

    /**
    * Spawn the creep
    * @param {Spawn} spawn The spawn to be used
    * @param {array} body The creep body
    * @param {Object} args Extra arguments
    **/
    doSpawn: function(spawn, body, args) {
        if (!spawn) { return -1; }
        if (!Array.isArray(body)) { return -1; }
        args = args || {};
        args.role = this.role;

        return spawn.createCreep(body, undefined, args);
    },

};

module.exports = roleRemoteHarvester;
