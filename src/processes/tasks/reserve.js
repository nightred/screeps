/*
 * task Reserve
 *
 * task reserve travels to a room and reserves the controller
 *
 */

var taskReserve = function() {
    // init
};

_.merge(taskReserve.prototype, require('lib.spawncreep'));

taskReserve.prototype.run = function() {
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
taskReserve.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (Game.cpu.bucket < 2000) return;

    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
        creep.goto(creep.room.controller, {
            range: 1,
            reusePath: 50,
            maxRooms: 1,
            ignoreCreeps: true,
        });
        return;
    }

    creep.reserveController(creep.room.controller);
};

taskReserve.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom || !workRoom.controller) return;

    let limit = 1;
    if (workRoom.controller.reservation &&
        workRoom.controller.reservation.ticksToEnd > C.CONTROLLER_RESERVE_MAX
    ) limit = 0;

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (spawnRoom && spawnRoom.storage &&
        spawnRoom.storage.store[RESOURCE_ENERGY] < C.DIRECTOR_MIN_ENG_RESERVER
    ) Limit = 0;

    let spawnDetail = {
        role: C.ROLE_CONTROLLER,
        priority: 70,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            style: 'reserve',
        },
        maxSize: 9999,
        minSize: 200,
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

registerProcess('tasks/reserve', taskReserve);
