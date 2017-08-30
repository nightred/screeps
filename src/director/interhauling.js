/*
 * Director Inter Hauling
 *
 * runs processes to manage the hauling of resources between two rooms
 *
 */

var directorInterHauling = function() {
    // init
}

directorInterHauling.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms[task.spawnRoom];

    if (!room || !room.controller || !room.controller.my) {
        return false;
    }

    // set size limits
    let minSize = 200;
    let maxSize = 200;

    switch (room.controller.level) {
    case 1:
    case 2:
    case 3:
    case 4:
        maxSize = 400;
        break;
    case 5:
    case 6:
        minSize = 400;
        maxSize = 600;
        break;
    case 7:
    case 8:
        minSize = 500;
        maxSize = 9999;
        break;
    };

    // set spawn limits
    let creepLimit = 2;

    if (task.creepLimit) {
        creepLimit = task.creepLimit;
    }

    if (!task.creep) {
        task.creep = [];
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
            role: C.ROLE_HAULER,
            priority: 66,
            directorId: task.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: task.workRoom,
                task: C.TASK_HAUL,
                style: 'longhauler',
            },
        };

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8);

    return true;
};

/**
* @param {Args} Args object with values for creation
**/
directorInterHauling.prototype.create = function(args) {
    let record = {
        director: C.DIRECTOR_INTERHAULING,
        workRoom: args.roomName,
        spawnRoom: args.spawnRoom,
        creepLimit: args.creepLimit,
        priority: 34,
    };

    return Game.Director.addRecord(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorInterHauling.prototype.flag = function(roomName, args) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    let record = {
        workRoom: roomName,
        spawnRoom: args[2],
        creepLimit: args[3],
    }

    return this.create(record);
};

module.exports = directorInterHauling;
