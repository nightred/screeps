/*
 * Director Source
 *
 * runs processes to manage mining of a source
 *
 */

var directorSource = function() {
    // init
}

directorSource.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms[task.workRoom];

    if (!room) {
        return false;
    }

    if (!task.creep) {
        task.creep = [];
    }

    // set spawn limits
    let creepLimit = 1;

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
            role: C.MINER,
            priority: 50,
            directorId: task.id,
            creepArgs: {
                sourceId: task.sourceId,
                workRoom: task.workRoom,
                task: C.TASK_SOURCE,
            },
        };

        let source = Game.getObjectById(task.sourceId);

        if (source && source.getDropContainer()) {
            record.creepArgs.style = 'drop';
        } else if (task.spawnRoom != task.roomName) {
            record.creepArgs.style = 'ranged';
        }

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8);

    return true;
};

module.exports = directorSource;
