/*
 * Director Hauling
 *
 * runs processes to manage the hauling of resources
 *
 */

var directorHauling = function() {
    // init
}

directorHauling.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms[task.workRoom];

    if (!room || !room.controller || !room.controller.my) {
        return false;
    }

    // set size limits
    let minSize = 200;
    let maxSize = 200;

    switch (room.controller.level) {
    case 1:
    case 2:
        maxSize = 300;
        break;
    case 3:
    case 4:
        maxSize = 400;
        break;
    case 5:
    case 6:
        maxSize = 500;
        break;
    case 7:
    case 8:
        maxSize = 9999;
        break;
    };

    // set spawn limits
    let creepLimit = room.getSourceCount();

    if (_.filter(room.getContainers(), structure =>
        structure.memory.type == 'in').length <= 0) {
        creepLimit = 0;
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
            role: C.HAULER,
            priority: 52,
            directorId: task.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: task.workRoom,
                task: C.TASK_HAUL,
                style: 'default',
            },
        };

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP;

    return true;
};

module.exports = directorHauling;
