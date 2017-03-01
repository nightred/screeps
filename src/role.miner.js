/*
 * Miner Role
 *
 * miner role that handles energy mining
 *
 */

var roleRemoteHarvester = {

    workTypes: [
        'mine',
        ],

    /** @param {Creep} creep **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('⛏️');
            } else {
               if (creep.memory.harvestTarget) {
                   let source = Game.getObjectById(creep.memory.harvestTarget);
                   source.removeHarvester();
               }
            }
        }

        if ((creep.memory.idleStart + Constant.CREEP_IDLE_TIME) < Game.time) {
            creep.moveToIdlePosition();
            return false;
        }

        this.doWork(creep);

        return true;
    },

    /** @param {Creep} creep **/
    doWork: function(creep) {
        if (!creep) { return false; }

        if (!creep.memory.workId) {
            if (!creep.getWork(this.workTypes)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');

                return false;
            }
        }

        if (!creep.doWork()) {
            if (Constant.DEBUG >= 2) { console.log("DEBUG - " + this.memory.role + " " + this.name + ' failed doWork'); }
        }

        return true;
    },

    getBody: function(args) {
        if (!args) { return -1; }

        let workUnits = Math.floor((energy * 0.5) / 100);  // 100
        let moveUnits = Math.floor((energy * 0.3) / 50);  // 50
        let carryUnits = Math.floor((energy * 0.2) / 50); // 50
        let bodyParts = [];

        workUnits = workUnits < 1 ? 1 : workUnits;
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        carryUnits = carryUnits < 1 ? 1 : carryUnits;

        workUnits = workUnits > 5 ? 5 : workUnits;
        moveUnits = moveUnits > 15 ? 15 : moveUnits;
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

        return bodyParts;
    },

    doSpawn: function(spawn, body, args) {
        if (!spawn) { return -1; }
        if (!Array.isArray(body)) { return -1; }
        args = args || {};

        args.role = 'miner';

        return spawn.createCreep(body, undefined, args);
    },

};

module.exports = roleRemoteHarvester;
