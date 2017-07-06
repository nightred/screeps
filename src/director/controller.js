/*
 * Director Upgrade
 *
 * runs processes to manage the upgrading of the controller
 *
 */

var directorUpgrade = function() {
    // init
}

directorUpgrade.prototype.run = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    let room = Game.rooms(task.workRoom);

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
    if (room.storage && room.controller.level < 8) {
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
        task.rcl8 = task.rcl8 ? task.rcl8 : 1;
    }

    if (C.SIM) {
        creepLimit = 1;
    };

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
            role: C.UPGRADER,
            priority: 60,
            directorId: task.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRoom: task.workRoom,
                task: C.TASK_UPGRADE,
            },
        };

        if (task.rcl8) { record.creepArgs.style = 'rcl8'; }

        task.spawnId = Game.Queue.spawn.addRecord(record);
    }

    return true;
};

modules.exports = directorUpgrade;
