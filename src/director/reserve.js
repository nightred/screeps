/*
 * Director Reserve
 *
 * runs processes to manage reserving rooms
 *
 */

var directorReserve = function() {
    // init
}

directorReserve.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms(task.workRoom);

    if (!room || !room.controller) {
        return false;
    }

    if (!task.creep) {
        task.creep = [];
    }

    // set spawn limits
    let creepLimit = 0;

    if (!room.controller.reservation ||
        (room.controller.reservation &&
        room.controller.reservation.ticksToEnd < C.CONTROLLER_RESERVE_MIN)) {
        creepLimit = 1;
    }

    // remove old creep and clear spawn job when done
    let removeCreep = [];

    for (let i = 0; i < task.creep.length; i++) {
        if (!Game.creeps[task.creep[i]]) {
            removeCreep.push(task.creep[i]);
        }
    }

    if (removeCreep.length > 0) {
        for (let i = 0; i < removeCreep.length; i++) {
            Game.Director.delCreep(task.id, removeCreep[i]);
        }
    }

    if (task.spawnId && !Game.Queue.getRecord(task.spawnId)) {
        task.spawnId = undefined;
    }

    // spawn new creep if below limit
    if (task.creep.length < creepLimit && !task.spawnId) {
        let record = {
            rooms: [ task.spawnRoom, ],
            role: C.CONTROLLER,
            priority: 70,
            directorId: task.id,
            creepArgs: {
                workRoom: task.workRoom,
                task: C.TASK_RESERVE,
                style: 'reserve',
            },
        };

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP;

    return true;
};

/**
* @param {Args} Args object with values for creation
**/
directorReserve.prototype.create = function(args) {
    let record = {
        director: C.DIRECTOR_RESERVE,
        workRoom: arg.roomName,
        spawnRoom: arg.spawnRoom,
        priority: 34,
    };

    return Game.Director.addRecord(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorReserve.prototype.flag = function(roomName, args) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    let record = {
        workRoom: roomName,
        spawnRoom: args[2],
    }

    return this.create(record);
};

modules.exports = directorReserve;
