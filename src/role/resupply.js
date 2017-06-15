/*
 * Resupply Role
 *
 * resupply role that handles filling extentions and spawn
 *
 */

var roleResupply = {

    /**
    * The role name
    **/
    role: C.RESUPPLY,

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

        if ((creep.memory.idleStart + C.CREEP_IDLE_TIME) > Game.time) {
            if (!creep.isFull() && creep.collectDroppedEnergy()) {
                return true;;
            }
            creep.moveToIdlePosition();
            return true;
        }

        // working has energy, else need energy
        if (creep.memory.working) {

            /**
            * The locations that energy can be stored
            **/
            let storeTargets = [
                'extention',
                'spawn',
                'containerOut',
                'container',
            ];

            let storage = creep.room.storage;
            if (storage &&
                storage.store[RESOURCE_ENERGY] > (storage.storeCapacity * C.ENERGY_STORAGE_SECONDARY_MIN)) {
                storeTargets.push('terminal');
                storeTargets.push('nuker');
                storeTargets.push('powerspawn');
            }

            if (!creep.doEmpty(storeTargets, RESOURCE_ENERGY)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {

            /**
            * The locations that energy can be withdrawn
            **/
            let fillTargets = [
                'storage',
                'linkStorage',
            ];

            if (!creep.doFill(fillTargets, RESOURCE_ENERGY)) {
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

        let carryUnits = Math.floor(energy / 75);
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        carryUnits = carryUnits > 8 ? 8 : carryUnits;

        let moveUnits = Math.ceil(carryUnits / 2);

        let body = [];
        for (let i = 0; i < carryUnits; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < moveUnits; i++) {
            body.push(MOVE);
        }

        return body;
    },

};

module.exports = roleResupply;
