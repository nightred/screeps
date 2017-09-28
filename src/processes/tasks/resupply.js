/*
 * task Resupply
 *
 * handles the filling of extentions and spawn
 *
 */

var taskResupply = function() {
    // init
};

_.merge(taskResupply.prototype, require('lib.spawncreep'));

taskResupply.prototype.run = function() {
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskResupply.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.manageState()) {
        if (creep.memory.working) {
            creep.say('🚚');
        } else {
            creep.say('🔋');
        }
    } else if (
        !creep.memory.working &&
        creep.carry.energy > (creep.carryCapacity * 0.2)
    )  {
        creep.toggleState();
        creep.say('🚚');
    }

    if (creep.memory.working) {
        this.storeEnergy(creep);
    } else {
        this.withdrawEnergy(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskResupply.prototype.withdrawEnergy = function(creep) {
    let targets = [
        'storage',
        'linkStorage',
    ];

    creep.doFill(targets, RESOURCE_ENERGY);
};

/**
* @param {Creep} creep The creep object
**/
taskResupply.prototype.storeEnergy = function(creep) {
    let targets = [
        'extention',
        'spawn',
        'containerOut',
        'container',
    ];

    let storage = creep.room.storage;

    if (
        storage &&
        storage.store[RESOURCE_ENERGY] > (storage.storeCapacity * C.ENERGY_STORAGE_SECONDARY_MIN)
    ) {
        targets.push('terminal');
        targets.push('nuker');
        targets.push('powerspawn');
    }

    creep.doEmpty(targets, RESOURCE_ENERGY);
};

registerProcess('tasks/resupply', taskResupply);
