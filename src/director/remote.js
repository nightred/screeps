/*
 * Director Remote
 *
 * runs processes to manage Remote rooms
 *
 */

var directorRemote = function() {
    // init
}

/**
* @param {task} task the director task memory
**/
directorRemote.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let spawnRoom = Game.rooms[task.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) {
        return false;
    }

    this.doDirectors(task);

    let workRoom = Game.rooms[task.workRoom];

    if (workRoom) {
        Game.Mil.defense.doRoom(workRoom, spawnRoom);
    }

    task.sleep = Game.time + C.DIRECTOR_SLEEP;

    return true;
};

/**
* @param {task} task the director task memory
**/
directorRemote.prototype.doDirectors = function(task) {
    if (!task.directorMine ||
        !Game.Director.getRecord(task.directorMine)) {
        let record = {
            director: C.DIRECTOR_MINING,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 41,
        };

        task.directorMine = Game.Director.addRecord(record);
    }

    if (!task.directorReserve ||
        !Game.Director.getRecord(task.directorReserve)) {
        let record = {
            director: C.DIRECTOR_RESERVE,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 48,
        };

        task.directorReserve = Game.Director.addRecord(record);
    }

    if (!task.directorInterhauling ||
        !Game.Director.getRecord(task.directorInterhauling)) {
        let record = {
            director: C.DIRECTOR_INTERHAULING,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 44,
        };

        task.directorInterhauling = Game.Director.addRecord(record);
    }

    if (!task.directorTech ||
        !Game.Director.getRecord(task.directorTech)) {
        let record = {
            director: C.DIRECTOR_TECH,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 46,
        };

        task.directorTech = Game.Director.addRecord(record);
    }

    return true;
};

/**
* @param {Args} Args object with values for creation
**/
directorRemote.prototype.create = function(args) {
    let record = {
        director: C.DIRECTOR_REMOTE,
        workRoom: args.roomName,
        spawnRoom: args.spawnRoom,
        priority: 40,
    };

    return Game.Director.addRecord(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorRemote.prototype.flag = function(roomName, args) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    let record = {
        roomName: roomName,
        spawnRoom: args[2],
    }

    return this.create(record);
};

module.exports = directorRemote;
