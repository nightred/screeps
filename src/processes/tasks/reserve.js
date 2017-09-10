/*
 * task Reserve
 *
 * task reserve travels to a room and reserves the controller
 *
 */

var taskReserve = function() {
    // init
};

taskReserve.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) {
        return;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (Game.cpu.bucket < 2000) { return true; }

    if (creep.room.name != creep.memory.workRoom) {
        creep.moveToRoom(creep.memory.workRoom);
        return;
    }

    if (!creep.room.controller || creep.room.controller.my) {
        task.completed = true;
        return;
    }

    if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
        let args = {
            range: 1,
            reusePath: 50,
            maxRooms: 1,
            ignoreCreeps: true,
        };

        creep.goto(creep.room.controller, args);
        return;
    }

    creep.reserveController(creep.room.controller);
};

registerProcess('tasks/reserve', taskReserve);
