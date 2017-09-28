/*
 * task Reserve
 *
 * task reserve travels to a room and reserves the controller
 *
 */

var taskReserve = function() {
    // init
};

_.merge(taskReserve.prototype, require('lib.spawncreep'));

taskReserve.prototype.run = function() {
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskReserve.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (Game.cpu.bucket < 2000) return;

    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
        creep.goto(creep.room.controller, {
            range: 1,
            reusePath: 50,
            maxRooms: 1,
            ignoreCreeps: true,
        });
        return;
    }

    creep.reserveController(creep.room.controller);
};

registerProcess('tasks/reserve', taskReserve);
