/*
 * task Reserve
 *
 * task reserve travels to a room and reserves the controller
 *
 */

var taskReserve = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    run: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (Game.cpu.bucket < 500) { return true; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            
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

module.exports = taskReserve;
