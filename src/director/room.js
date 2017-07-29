/*
 * Director Room
 *
 * runs processes to manage the room
 *
 */

var directorRoom = function() {
    // init
}

/**
* @param {task} task the director task memory
**/
directorRoom.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms[task.workRoom];

    if (!room || !room.controller || !room.controller.my) {
        return false;
    }

    this.doDirectors(task);

    Game.Mil.defense.doRoom(room);

    task.sleep = Game.time + C.DIRECTOR_SLEEP;

    return true;
};

directorRoom.prototype.doDirectors = function(task) {
    if (!task.directorMine ||
        !Game.Director.getRecord(task.directorMine)) {
        let record = {
            director: C.DIRECTOR_MINING,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 21,
        };

        task.directorMine = Game.Director.addRecord(record);
    }

    if (!task.directorController ||
        !Game.Director.getRecord(task.directorController)) {
        let record = {
            director: C.DIRECTOR_CONTROLLER,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 25,
        };

        task.directorController = Game.Director.addRecord(record);
    }

    if (!task.directorResupply ||
        !Game.Director.getRecord(task.directorResupply)) {
        let record = {
            director: C.DIRECTOR_RESUPPLY,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 22,
        };

        task.directorResupply = Game.Director.addRecord(record);
    }

    if (!task.directorHaul ||
        !Game.Director.getRecord(task.directorHaul)) {
        let record = {
            director: C.DIRECTOR_HAULING,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 24,
        };

        task.directorHaul = Game.Director.addRecord(record);
    }

    if (!task.directorStocking ||
        !Game.Director.getRecord(task.directorStocking)) {
        let record = {
            director: C.DIRECTOR_STOCKING,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 23,
        };

        task.directorStocking = Game.Director.addRecord(record);
    }

    if (!task.directorTech ||
        !Game.Director.getRecord(task.directorTech)) {
        let record = {
            director: C.DIRECTOR_TECH,
            workRoom: task.workRoom,
            spawnRoom: task.spawnRoom,
            priority: 26,
        };

        task.directorTech = Game.Director.addRecord(record);
    }

    return true;
};

/**
* @param {Args} Args object with values for creation
**/
directorRoom.prototype.create = function(args) {
    let record = {
        director: C.DIRECTOR_ROOM,
        workRoom: args.roomName,
        spawnRoom: args.roomName,
        priority: 20,
    };

    return Game.Director.addRecord(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorRoom.prototype.flag = function(roomName, args) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    let record = {
        roomName: roomName,
    }

    return this.create(record);
};

module.exports = directorRoom;
