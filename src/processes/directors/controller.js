/*
 * Director Controller
 *
 * runs processes to manage the upgrading of the controller
 *
 */

var directorController = function() {
    // init
}

directorController.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.roomName];

    if (!room || !room.controller || !room.controller.my) {
        return false;
    }

    // set size limits
    let minSize = 200;
    let maxSize = 9999;

    switch (room.controller.level) {
    case 1:
    case 2:
        break;
    case 3:
        minSize = 300;
        break;
    case 4:
    case 5:
        minSize = 400;
        break;
    case 6:
    case 7:
    case 8:
        minSize = 600;
        break;
    };

    // set spawn limits
    let creepLimit = 2;
    if (room.storage && room.controller.level < 8 && room.controller.level >= 4) {
        if (room.storage.store[RESOURCE_ENERGY] < 50000 ) {
            creepLimit = 1;
        } else if (room.storage.store[RESOURCE_ENERGY] < 80000 ) {
            creepLimit = 2;
        } else if (room.storage.store[RESOURCE_ENERGY] < 150000 ) {
            creepLimit = 3;
        } else if (room.storage.store[RESOURCE_ENERGY] < 200000 ) {
            creepLimit = 4;
        } else if (room.storage.store[RESOURCE_ENERGY] >= 200000 ) {
            creepLimit = 5;
        }
    } else if (room.controller.level == 8 ) {
        creepLimit = 1;
        this.memory.rcl8 = this.memory.rcl8 ? this.memory.rcl8 : 1;
    }

    if (C.SIM) {
        creepLimit = 1;
    };

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
            role: C.ROLE_UPGRADER,
            priority: 60,
            directorId: this.memory.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: this.memory.workRoom,
                task: C.TASK_UPGRADE,
            },
        };

        if (this.memory.rcl8) { record.creepArgs.style = 'rcl8'; }

        this.memory.spawnId = Game.Queue.spawn.addRecord(record);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

registerProcess(C.DIRECTOR_CONTROLLER, directorController);
