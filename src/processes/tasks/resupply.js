/*
 * task Resupply
 *
 * handles the filling of extentions and spawn
 *
 */

var taskResupply = function() {
    // init
};

_.merge(taskResupply.prototype, require('lib.spawn.creep'));

taskResupply.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doSpawnDetails();
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
    if (storage &&
        storage.store[RESOURCE_ENERGY] > (storage.storeCapacity * C.ENERGY_STORAGE_SECONDARY_MIN)
    ) {
        targets.push('nuker');
        targets.push('powerspawn');
    }

    creep.doEmpty(targets, RESOURCE_ENERGY);
};

taskResupply.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 4 || rlevel == 5 || rlevel == 6)  {
        maxSize = 500;
    } else if (rlevel == 7 || rlevel == 8) {
        maxSize = 9999;
    }

    let limit = 2;
    if (!spawnRoom.storage) limit = 0;

    let spawnDetail = {
        role: C.ROLE_RESUPPLY,
        priority: 10,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {},
        maxSize: maxSize,
        minSize: minSize,
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

registerProcess(C.TASK_RESUPPLY, taskResupply);
