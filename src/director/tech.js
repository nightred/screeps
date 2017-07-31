/*
 * Director Tech
 *
 * manages the spawning of techs
 *
 */

var directorTech = function() {
    // init
}

directorTech.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let workRoom = Game.rooms[task.workRoom];

    let findWorkTasks = [
        C.WORK_TOWER_REFILL,
        C.WORK_REPAIR,
        C.WORK_CONSTRUCTION,
    ];

    for (let i = 0; i < findWorkTasks.length; i++) {
        Game.Work.findWork(findWorkTasks[i], workRoom);
    }

    let spawnRoom = Game.rooms[task.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) {
        return true;
    }

    // set size limits
    let minSize = 200;
    let maxSize = 9999;

    switch (spawnRoom.controller.level) {
    case 1:
    case 2:
        maxSize = 300;
        break;

    case 3:
        maxSize = 400;
        break;

    case 4:
        minSize = 300;
        maxSize = 400;
        break;

    case 5:
    case 6:
        minSize = 400;
        maxSize = 500;
        break;

    case 7:
    case 8:
        minSize = 400;
        maxSize = 9999;
        break;

    };

    if (spawnRoom.storage && spawnRoom.controller.level < 4) {
        minSize = 200;
    }

    // set spawn limits
    let creepLimit = 1;

    if (!task.creepLimit) {
        if (workRoom && workRoom.controller && workRoom.controller.my &&
            workRoom.controller.level >= 4) {
            creepLimit = 2;
        }
    } else {
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
            role: C.TECH,
            priority: 54,
            directorId: task.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: task.workRoom,
                task: C.TASK_TECH,
            },
        };

        if (task.rcl8) { record.creepArgs.style = 'rcl8'; }

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP;

    return true;
};

/**
* @param {Args} Args object with values for creation
**/
directorTech.prototype.create = function(args) {
    let record = {
        director: C.DIRECTOR_TECH,
        workRoom: args.roomName,
        spawnRoom: args.spawnRoom,
        priority: 36,
    };

    if (args.creepLimit) {
        record.creepLimit = args.creepLimit;
    }

    return Game.Director.addRecord(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorTech.prototype.flag = function(roomName, args) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    let record = {
        workRoom: roomName,
        spawnRoom: args[2],
        creepLimit: args[3],
    }

    return this.create(record);
};

module.exports = directorTech;
