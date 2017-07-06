/*
 * task Resupply
 *
 * handles the filling of extentions and spawn
 *
 */

var taskResupply = {

    /**
    * @param {Creep} creep The creep object
    **/
    run: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚚');
            } else {
                creep.say('🔋');
            }
        } else if (!creep.memory.working && creep.carry.energy > (creep.carryCapacity * 0.2))  {
            creep.toggleState();
            creep.say('🚚');
        }

        if (creep.memory.working) {
            this.storeEnergy(creep);
        } else {
            this.withdrawEnergy(creep);
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    withdrawEnergy: function(creep) {
        let targets = [
            'storage',
            'linkStorage',
        ];

        creep.doFill(targets, RESOURCE_ENERGY);

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    storeEnergy: function(creep) {
        let targets = [
            'extention',
            'spawn',
            'containerOut',
            'container',
        ];

        let storage = creep.room.storage;

        if (storage &&
            storage.store[RESOURCE_ENERGY] > (storage.storeCapacity * C.ENERGY_STORAGE_SECONDARY_MIN)) {
            targets.push('terminal');
            targets.push('nuker');
            targets.push('powerspawn');
        }

        creep.doEmpty(targets, RESOURCE_ENERGY);

        return true;
    },

};

module.exports = taskResupply;
