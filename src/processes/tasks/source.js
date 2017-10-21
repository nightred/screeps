/*
 * task Source
 *
 * harvestes energy from the source
 *
 */

var taskSource = function() {
    // init
};

_.merge(taskSource.prototype, require('lib.spawn.creep'));

Object.defineProperty(taskSource.prototype, 'taskHaulers', {
    get: function() {
        if (!this.memory._haulersPid) return false;
        return Game.kernel.getProcessByPid(this.memory._haulersPid);
    },
    set: function(value) {
        this.memory._haulersPid = value.pid;
    },
});

taskSource.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom || !this.memory.sourceId) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doSpawnDetails();
    this.doCreepSpawn();

    for (var i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }

    this.doHaulers();
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if ((creep.carryCapacity * 0.8) > _.sum(creep.carry) || creep.carryCapacity == 0) {
        this.doWork(creep);
    } else {
        this.doEmpty(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doEmpty = function(creep) {
    let energyTargets = [
        'linkIn',
        'containerIn',
        'spawn',
        'extention',
        'container',
        'containerOut',
        'storage',
    ];

    let source = Game.getObjectById(this.memory.sourceId);

    if (!creep.memory.goingTo && source) {
        creep.memory.goingTo = source.getLocalContainer();
    }

    creep.doEmpty(energyTargets, RESOURCE_ENERGY);
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doWork = function(creep) {
    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    switch (creep.memory.style) {
    case 'drop':
        this.doDropHarvest(creep);
        break;
    default:
        this.doHarvest(creep);
        break;
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doHarvest = function(creep) {
    let source = Game.getObjectById(this.memory.sourceId);

    if (!creep.pos.inRangeTo(source, 1)) {
        creep.goto(source, {
            range: 1,
            maxRooms:1,
            reUsePath: 80,
            maxOps: 4000,
            ignoreCreeps: true,
        });

        return;
    }

    if (creep.carry[RESOURCE_ENERGY] > 0 && !source.getLocalContainer()) {
        let construction = creep.room.getConstructionAtArea(source.pos, 1);

        if (construction) {
            creep.build(construction);
            return;
        }
    }

    creep.harvest(source);
};

taskSource.prototype.doDropHarvest = function(creep) {
    let source = Game.getObjectById(this.memory.sourceId);

    let target = Game.getObjectById(source.getDropContainer());
    if (!target) {
        source.clearContainer();
        creep.doDespawn();
        return;
    }

    if (!creep.pos.isEqualTo(target)) {
        creep.goto(target, {
            range: 0,
            maxRooms:1,
            reUsePath: 80,
            maxOps: 4000,
        });
        return;
    }

    if (_.sum(target.store) >= (target.storeCapacity * C.ENERGY_CONTAINER_MAX_PERCENT)) {
        return;
    }

    creep.harvest(source);
};

taskSource.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let source = Game.getObjectById(this.memory.sourceId);
    if (!source) return;
    let style = 'default';
    if (source.getDropContainer()) {
        style = 'drop';
    } else if (this.memory.spawnRoom != this.memory.workRoom) {
        style = 'ranged';
    }

    let spawnDetail = {
        role: C.ROLE_MINER,
        priority: 50,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            style: style,
        },
        limit: 1,
    };

    this.setSpawnDetails(spawnDetail);
};

taskSource.prototype.doHaulers = function() {
    if (this.memory._sleepHaulers && this.memory._sleepHaulers > Game.time) return;
    this.memory._sleepHaulers = Game.time + (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20));

    let source = Game.getObjectById(this.memory.sourceId);
    if (!source) return;
    let containerInID = source.getContainerIn();
    if (!containerInID) return;

    let process = this.taskHaulers;
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_HAUL, {
            spawnRoom: this.memory.spawnRoom,
            workRoom: this.memory.workRoom,
            containerId: containerInID,
        });
        this.taskHaulers = process;
    }
};

registerProcess('tasks/source', taskSource);
