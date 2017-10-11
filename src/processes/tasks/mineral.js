/*
 * task Mineral
 *
 * harvest mineral from the extractor
 *
 */

var logger = new Logger('[Task Mineral]');

var taskMineral = function() {
    // init
};

_.merge(taskMineral.prototype, require('lib.spawn.creep'));

Object.defineProperty(taskMineral.prototype, 'taskHaulers', {
    get: function() {
        if (!this.memory._haulersPid) return false;
        return Game.kernel.getProcessByPid(this.memory._haulersPid);
    },
    set: function(value) {
        this.memory._haulersPid = value.pid;
    },
});

taskMineral.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom ||
        !this.memory.mineralId || !this.memory.extractorId
    ) {
        logger.debug('removing process missing values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom +
            ', extractorId: ' + this.memory.extractorId +
            ', mineralId: ' + this.memory.mineralId
        );
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

    this.doHaulers();
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    if (0 === _.sum(creep.carry) || creep.carryCapacity === 0) {
        this.doWork(creep);
    } else {
        this.doEmpty(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doEmpty = function(creep) {
    if (!this.memory.containerId) {
        let mineral = Game.getObjectById(creep.memory.mineralId);
        this.memory.containerId = mineral.getContainer();
    }

    let container = Game.getObjectById(this.memory.containerId);
    if (!container) {
        let mineral = Game.getObjectById(creep.memory.mineralId);
        mineral.clearContainer();
        this.memory.containerId = undefined;
        return;
    }

    creep.doTransfer(container);
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doWork = function(creep) {
    let mineral = Game.getObjectById(this.memory.mineralId);

    if (creep.memory.style == 'drop') {
        if (!this.memory.containerId) {
            this.memory.containerId = mineral.getContainer();
        }

        let container = Game.getObjectById(this.memory.containerId);
        if (!container) {
            mineral.clearContainer();
            this.memory.containerId = undefined;
            return;
        }

        if (!creep.pos.isEqualTo(container)) {
            creep.goto(container, {
                range: 0,
                maxRooms:1,
                reUsePath: 80,
            });
            return;
        }

    } else {
        if (!creep.pos.inRangeTo(mineral, 1)) {
            creep.goto(mineral, {
                range: 1,
                reusePath: 30,
                maxRooms: 1,
                ignoreCreeps: true,
            });
            return;
        }
    }

    if (Memory.world.mineralDisable) return;
    if (Game.time % 6 !== 0) return;
    creep.harvest(mineral)
};

taskMineral.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom) return;
    let mineral = Game.getObjectById(this.memory.mineralId);
    if (!mineral) return;

    let style = 'default';
    if (mineral.getContainer()) style = 'drop';

    let limit = 1;
    if (mineral.mineralAmount === 0 || (spawnRoom.storage &&
        spawnRoom.storage.store[RESOURCE_ENERGY] < C.DIRECTOR_MIN_ENG_MINERAL)
    ) limit = 0;

    let spawnDetail = {
        role: C.ROLE_MINER,
        priority: 85,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            style: style,
        },
        maxSize: 9999,
        minSize: 200,
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

taskMineral.prototype.doHaulers = function() {
    if (this.memory._sleepHaulers && this.memory._sleepHaulers > Game.time) return;
    this.memory._sleepHaulers = Game.time + (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20));

    let mineral = Game.getObjectById(this.memory.mineralId);
    if (!mineral) return;
    let containerInID = mineral.getContainer();
    if (!containerInID) return;

    if (!this.taskHaulers) {
        let process = Game.kernel.startProcess(this, C.TASK_HAUL, {
            spawnRoom: this.memory.spawnRoom,
            workRoom: this.memory.workRoom,
            containerId: containerInID,
        });
        this.taskHaulers = process;
    }
};

registerProcess('tasks/mineral', taskMineral);
