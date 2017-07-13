/*
 * role Tech
 *
 * tech role defines the general server creep
 *
 */

var roleTech = {

    /**
    * The role name
    **/
    role: C.TECH,

    /**
    * @param {Creep} creep
    **/
    doRole: function(creep) {
        if (!creep) { return false; }

        if (creep.getOffExit()) {
            return true;
        }

        if (creep.isSleep()) {
            if (!creep.isFull() && creep.collectDroppedEnergy()) {
                return true;;
            }

            creep.moveToIdlePosition();
            return true;
        }

        let workTasks = [
            C.REPAIR,
            C.TOWER_REFILL,
            C.CONSTRUCTION,
            C.SIGNCONTROLLER,
            C.TERMINAL_EMPTY,
        ];

        if (!creep.memory.workId) {
            if (!creep.getWork(workTasks)) {
                creep.sleep();
                creep.say('💤');

                return true;
            }
        }

        if (!creep.doWork()) {
            if (C.DEBUG >= 2) { console.log('DEBUG - do work failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
        }

        return true;
    },

    /**
    * Create the body of the creep for the role
    * @param {number} energy The amount of energy avalible
    * @param {Object} args Extra arguments
    **/
    getBody: function(energy, args) {
        if (isNaN(energy)) { return ERR_INVALID_ARGS; }
        args = args || {};

        let workUnits = Math.floor((energy * 0.6) / 150);
        workUnits = workUnits < 1 ? 1 : workUnits;
        workUnits = workUnits > 6 ? 6 : workUnits;

        let moveUnits = workUnits;
        energy -= 150 * workUnits;

        let carryUnits = Math.floor(energy / 100);
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 10 ? 10 : carryUnits;

        moveUnits += carryUnits;
        energy -= 100 * carryUnits;

        let body = [];
        for (let i = 0; i < workUnits; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }
        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }

        return body;
    },

};

module.exports = roleTech;
