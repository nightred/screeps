/*
 * task Stock
 *
 * stock manages the filling of links and structures
 *
 */

var taskStock = function() {
    // init
};

taskStock.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) {
        return;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

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
            return;
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


    if (creep.isSleep()) {
        creep.memory.activity = undefined;

        creep.doEmpty(['storage',], RESOURCE_ENERGY);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskStock.prototype.getTask = function(creep) {
    let room = creep.room;

    if (!room.storage) {
        return;
    }

    let linksStorage = _.filter(room.getLinks(), structure =>
        structure.memory.type == 'storage');

    if (linksStorage.length <= 0) {
        return;
    }

    let linkStorage = linksStorage[0];

    if (linkStorage.energy > (linkStorage.energyCapacity * C.ENERGY_LINK_STORAGE_MAX)) {
        creep.memory.activity = 'store';
        return;
    }

    if (linkStorage.energy < (linkStorage.energyCapacity * C.ENERGY_LINK_STORAGE_MIN)) {
        creep.memory.activity = 'fill';
        return;
    }
};

registerProcess('tasks/stock', taskStock);
