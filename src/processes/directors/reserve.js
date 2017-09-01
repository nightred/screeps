/*
 * Director Reserve
 *
 * runs processes to manage reserving rooms
 *
 */

var directorReserve = function() {
    // init
}

directorReserve.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.workRoom];

    if (!room || !room.controller) {
        return false;
    }

    if (!this.memory.creep) {
        this.memory.creep = [];
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

    for (let i = 0; i < this.memory.creep.length; i++) {
        if (!Game.creeps[this.memory.creep[i]]) {
            removeCreep.push(this.memory.creep[i]);
        }
    }

    if (removeCreep.length > 0) {
        for (let i = 0; i < removeCreep.length; i++) {
            directorRemoveCreep(this.pid, removeCreep[i]);
        }
    }

    if (this.memory.spawnId && !getQueueRecord(this.memory.spawnId)) {
        this.memory.spawnId = undefined;
    }

    // spawn new creep if below limit
    if (this.memory.creep.length < creepLimit && !this.memory.spawnId) {
        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: C.ROLE_CONTROLLER,
            priority: 70,
            directorId: this.memory.id,
            creepArgs: {
                workRoom: this.memory.workRoom,
                task: C.TASK_RESERVE,
                style: 'reserve',
            },
        };

        this.memory.spawnId = addQueueSpawn(record);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorReserve.prototype.flag = function(roomName, args) {
    this.memory.roomName = roomName;
    this.memory.spawnRoom = args[2];
};

registerProcess(C.DIRECTOR_RESERVE, directorReserve);
