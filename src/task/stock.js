/*
 * task Stock
 *
 * stock manages the filling of links and structures
 *
 */

var taskStock = {

    /**
    * @param {Creep} creep The creep object
    **/
    run: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🔗');
            } else {
                creep.say('🔋');
                creep.memory.activity = undefined;
            }
        } else if (!creep.memory.working && creep.carry.energy > (creep.carryCapacity * 0.2)) {
            creep.toggleState();
            creep.say('🔗');
        }

        if (!creep.memory.activity) {
            if (!this.getTask(creep))  {
                return true;
            }
        }

        let energyInTargets = [];
        let energyOutTargets = [];

        switch (creep.memory.activity) {
        case 'store':
            energyInTargets = ['linkStorage',];
            energyOutTargets = ['storage',];
            break;
        case 'fill':
            energyOutTargets = ['linkStorage',];
            energyInTargets = ['storage',];
            break;
        }

        if (creep.memory.working) {
            creep.doEmpty(energyOutTargets, RESOURCE_ENERGY);
        } else {
            creep.doFill(energyInTargets, RESOURCE_ENERGY);
        }


        if (creep.memory.idleStart && creep.memory.idleStart == Game.time) {
            creep.memory.activity = undefined;
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    getTask: function(creep) {
        let room = creep.room;

        if (!room.storage) {
            return false;
        }

        let linksStorage = _.filter(room.getLinks(), structure =>
            structure.memory.type == 'storage');

        if (linksStorage.length <= 0) {
            return false;
        }

        let linkStorage = linksStorage[0];

        if (linkStorage.energy > (linkStorage.energyCapacity * C.ENERGY_LINK_STORAGE_MAX)) {
            creep.memory.activity = 'store';
            return true;
        }

        if (linkStorage.energy < (linkStorage.energyCapacity * C.ENERGY_LINK_STORAGE_MIN)) {
            creep.memory.activity = 'fill';
            return true;
        }

        return false;
    },

};

module.exports = taskStock;
