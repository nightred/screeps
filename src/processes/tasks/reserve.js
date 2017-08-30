/*
 * task Reserve
 *
 * task reserve travels to a room and reserves the controller
 *
 */

var taskReserve = {

    // Run the requested task
    run: function() {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            Game.kernel.killProcess(this.pid);
        }

        if (creep.getOffExit()) {
            return true;
        }

        if (creep.isSleep()) {
            creep.moveToIdlePosition();
            return true;
        }

        if (Game.cpu.bucket < 2000) { return true; }

        if (creep.room.name != creep.memory.workRoom) {
            creep.moveToRoom(creep.memory.workRoom);

            return true;
        }

        if (!creep.room.controller || creep.room.controller.my) {
            return creep.removeWork();
        }

        if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
            let args = {
                range: 1,
                reusePath: 50,
                maxRooms: 1,
                ignoreCreeps: true,
            };

            creep.goto(creep.room.controller, args);

            return true;
        }

        creep.reserveController(creep.room.controller);

        return true;
    },

};

registerProcess('tasks/reserve', taskReserve);
