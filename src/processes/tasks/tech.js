/*
 * task Tech
 *
 * handles the spawning od tech units
 *
 */

var taskTech = function() {
    // init
};

_.merge(taskTech.prototype, require('lib.spawn.creep'));

taskTech.prototype.run = function() {
    if (!this.memory.spawnRoom) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom) return;
    this.roomCoverage = spawnRoom.getCoverage();

    this.doSpawnDetails();
    this.doCreepSpawn();

    for (var i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskTech.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (!creep.hasWork()) {
        let workTasks = [
            C.WORK_REPAIR,
            C.WORK_TOWER_REFILL,
            C.WORK_CONSTRUCTION,
            C.WORK_SIGNCONTROLLER,
            C.WORK_TERMINAL_EMPTY,
        ];

        if (!creep.getWork(workTasks,{
            rooms: this.roomCoverage,
        })) {
            creep.sleep();
            creep.say('💤');
            return;
        } else {
            creep.say('📋');
        }
    }

    creep.doWork();
};

taskTech.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let limit = spawnRoom.countCoverage();
    if (spawnRoom.controller.level >= 4) limit++
    if (limit > 4) limit = 4;
    if (spawnRoom.storage &&
        spawnRoom.storage.store[RESOURCE_ENERGY] < C.DIRECTOR_MIN_ENG_TECH
    ) limit = 1;

    let spawnDetail = {
        role: C.ROLE_TECH,
        priority: 58,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {},
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

registerProcess('tasks/tech', taskTech);
