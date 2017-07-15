/*
 * role Crash Tech
 *
 * crash tech role defines remote tech that will mine at the work site
 *
 */

var roleCrashTech = {

    /**
    * The role name
    **/
    role: C.CRASHTECH,

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('⚙');
                creep.memory.harvestTarget = false;
            } else {
                creep.say('🔋');
                creep.leaveWork();
            }
        }

        if (creep.getOffExit()) { return true; }
        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            if (!creep.isFull() && creep.collectDroppedEnergy()) {
                return true;;
            }
            creep.moveToIdlePosition();
            return true;
        }

        if (creep.room.name != creep.memory.workRooms[0]) {
            creep.moveToRoom(creep.memory.workRooms[0]);
            return true;
        }

        let workTasks = [
            C.WORK_CONSTRUCTION,
            C.WORK_SIGNCONTROLLER,
        ];

        if (creep.memory.working) {
            if (!creep.memory.workId) {
                if (!creep.getWork(workTasks)) {
                    creep.memory.idleStart = Game.time;
                    creep.say('💤');

                    return true;
                }
            }

            if (!creep.doWork()) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            this.doMine(creep);
        }

        return true;
    },

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        let workUnits = Math.floor((energy * 0.5) / 125);
        workUnits = workUnits < 1 ? 1 : workUnits;
        workUnits = workUnits > 10 ? 10 : workUnits;
        energy -= 125 * workUnits;
        let carryUnits = Math.floor(energy / 75);
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 20 ? 20 : carryUnits;
        moveUnits = Math.ceil((workUnits + carryUnits) / 2);
        if (moveUnits == Math.floor((workUnits + carryUnits) / 2)) {
            moveUnits += 1;
        }

        let body = [];
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        return body;
    },

    doMine: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (!creep.memory.harvestTarget) {
            let sources = creep.room.getSources();
            if (sources.length <= 0) { return true; }
            sources = _.sortBy(sources, source => source.energy).reverse();
            creep.memory.harvestTarget = sources[0].id;
        }

        let source = Game.getObjectById(creep.memory.harvestTarget);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.goto(source, { range: 1, reUsePath: 80, ignoreCreeps: true, });
        }

        return true;
    },

};

module.exports = roleCrashTech;
