/*
 * Director Stocking
 *
 * manages the stocking of resources in links and other buildings
 *
 */

var directorStocking = function() {
    // init
}

directorStocking.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms(task.workRoom);

    if (!room || !room.storage || !room.controller || !room.controller.my) {
        return false;
    }

    // set spawn limits
    let creepLimit = 0;

    if (_.filter(room.getLinks(), structure =>
        structure.memory.type == 'storage').length > 0) {
        creepLimit = 1;
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
            role: C.STOCKER,
            priority: 49,
            directorId: task.id,
            creepArgs: {
                workRoom: task.workRoom,
                task: C.TASK_STOCK,
            },
        };

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP;

    return true;
};

modules.exports = directorStocking;
