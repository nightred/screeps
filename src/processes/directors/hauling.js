/*
 * Director Hauling
 *
 * runs processes to manage the hauling of resources
 *
 */

var directorHauling = function() {
    // init
}

directorHauling.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.workRoom];

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

    if (this.memory.spawnId && !Game.Queue.getRecord(this.memory.spawnId)) {
        this.memory.spawnId = undefined;
    }

    // spawn new creep if below limit
    if (this.memory.creep.length < creepLimit && !this.memory.spawnId) {
        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: C.ROLE_HAULER,
            priority: 52,
            directorId: this.memory.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: this.memory.workRoom,
                task: C.TASK_HAUL,
                style: 'default',
            },
        };

        this.memory.spawnId = Game.Queue.spawn.addRecord(record);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

registerProcess(C.DIRECTOR_HAULING, directorHauling);
