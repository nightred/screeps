/*
 * Director Mining
 *
 * runs processes to manage mining in the room
 *
 */

var directorMining = function() {
    // init
}

directorMining.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms[task.workRoom];

    if (!room) {
        return false;
    }

    if (!task.sourceInit) {
        if (this.getSources(task)) {
            task.sourceInit = 1;
        }
    }

    for (let i = 0; i < task.sources.length; i++) {
        let source = task.sources[i];

        if (!source.directorId || !Game.Director.getRecord(source.directorId)) {
            let record = {
                director: C.DIRECTOR_SOURCE,
                workRoom: task.workRoom,
                spawnRoom: task.spawnRoom,
                sourceId: source.id,
                priority: 22,
            };

            source.directorId = Game.Director.addRecord(record);
        }
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8);

    return true;
};

directorMining.prototype.getSources = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    task.sources = task.sources || [];

    let room = Game.rooms[task.workRoom];

    if (!room) {
        return false;
    }

    let sources = room.getSources();

    if (sources.length <= 0) {
        return true;
    }

    for (let i = 0; i < sources.length; i++) {
        let source = {
            id: sources[i].id,
            directorId: undefined,
        };

        task.sources.push(source);
    }

    return true;
};

/**
* @param {Args} Args object with values for creation
**/
directorMining.prototype.create = function(args) {
    let record = {
        director: C.DIRECTOR_MINING,
        workRoom: args.roomName,
        spawnRoom: args.spawnRoom,
        priority: 21,
    };

    return Game.Director.addRecord(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorMining.prototype.flag = function(roomName, args) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    let record = {
        workRoom: roomName,
        spawnRoom: args[2],
    }

    return this.create(record);
};

module.exports = directorMining;
