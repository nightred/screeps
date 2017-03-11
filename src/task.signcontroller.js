/*
 * task Mine
 *
 * mine task harvestes the source for energy
 *
 */

var taskMine = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (task.workRooms.length <= 0) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        if (!creep.room.controller) {
            return creep.removeWork();
        }
        if (creep.room.controller.sign) {
            if (creep.room.controller.sign.text == task.message) {
                return creep.removeWork();
            }
        }

        if (creep.signController(creep.room.controller, task.message) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { range: 1, });
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return -1; }
        // task creation for the room
    },

};

module.exports = taskMine;
