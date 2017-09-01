/*
 * Director Inter Hauling
 *
 * runs processes to manage the hauling of resources between two rooms
 *
 */

var directorInterHauling = function() {
    // init
}

directorInterHauling.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.spawnRoom];

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

    if (this.memory.creepLimit) {
        creepLimit = this.memory.creepLimit;
    }

    if (!this.memory.creep) {
        this.memory.creep = [];
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
            role: C.ROLE_HAULER,
            priority: 66,
            directorId: this.memory.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: this.memory.workRoom,
                task: C.TASK_HAUL,
                style: 'longhauler',
            },
        };

        this.memory.spawnId = addQueueSpawn(record);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

registerProcess(C.DIRECTOR_INTERHAULING, directorInterHauling);
