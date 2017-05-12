/*
 * role Upgrader
 *
 * template role defines the basic layout of a role
 *
 */

var roleUpgrader = {

    /**
    * The role name
    **/
    role: C.UPGRADER,

    /**
    * The work tasks that the role is created for
    **/
    workTasks: [
        C.UPGRADE,
    ],

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('📡');
            } else {
                creep.say('🔋');
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

        let energyTargets = [
            'linkOut',
            'containerOut',
        ];

        if (!creep.room.storage) {
            energyTargets.push('container');
            energyTargets.push('extention');
            energyTargets.push('spawn');
        }

        if (creep.memory.working) {
            if (!creep.doWork()) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (!creep.doFillEnergy(energyTargets)) {
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
        args.style = args.style || 'default';

        let workUnits = 0;
        let moveUnits = 0;
        let carryUnits = 1;
        let body = [];
        energy -= 50;
        body.push(CARRY);
        switch (args.style) {
            case 'rcl8':
                workUnits = Math.floor(energy / 125);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 15 ? 15 : workUnits;
                moveUnits = workUnits;
                break;
            default:
                workUnits = Math.floor(energy / 125);
                workUnits = workUnits < 1 ? 1 : workUnits;
                workUnits = workUnits > 10 ? 10 : workUnits;
        }
        moveUnits = Math.ceil(workUnits / 2);
        if (moveUnits == Math.floor(workUnits / 2)) {
            moveUnits += 1;
        }

        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < moveUnits; i++) {
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

};

module.exports = roleUpgrader;
