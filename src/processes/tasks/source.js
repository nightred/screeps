/*
 * task Source
 *
 * harvestes energy from the source
 *
 */

var taskSource = function() {
    // init
};

_.merge(taskSource.prototype, require('lib.spawncreep'));

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
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }

    this.doInterHaulers();
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

    let source = Game.getObjectById(creep.memory.sourceId);

    if (!creep.memory.goingTo && source) {
        creep.memory.goingTo = source.getLocalContainer();
    }

    creep.doEmpty(energyTargets, RESOURCE_ENERGY);
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doWork = function(creep) {
    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
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
    let source = Game.getObjectById(creep.memory.sourceId);

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
    let source = Game.getObjectById(creep.memory.sourceId);

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

taskSource.prototype.doInterHaulers = function() {
    if (this.memory.spawnRoom !== this.memory.workRoom) return;
    
    if (this.memory.sleepInterHaulers && this.memory.sleepInterHaulers > Game.time)
        return;
    this.memory.sleepInterHaulers = Game.time + (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 1 || rlevel == 2 || rlevel == 3 || rlevel == 4) {
        maxSize = 400;
    } else if (rlevel == 5 || rlevel == 6) {
        minSize = 400;
        maxSize = 600;
    } else if (rlevel == 7 || rlevel == 8) {
        minSize = 500;
        maxSize = 9999;
    }

    let limit = 1;

    let process = this.taskHaulers;
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_HAUL, {});
        if (!process) {
            logger.error('failed to create process ' + C.TASK_HAUL);
            return;
        }
        this.taskHaulers = process;
    }

    process.setSpawnDetails({
        spawnRoom: this.memory.spawnRoom,
        role: C.ROLE_HAULER,
        priority: 52,
        maxSize: maxSize,
        minSize: minSize,
        limit: limit,
        creepArgs: {
            style: 'longhauler',
            workRooms: this.memory.workRoom,
        },
    });
};

registerProcess('tasks/source', taskSource);
