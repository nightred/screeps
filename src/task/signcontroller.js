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
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
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
            creep.moveTo(creep.room.controller, { range: 1, maxRooms: 1, });
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        if (!task.init) {
            this.printConfig(task);
            task.init = 1;
        }

        if (!task.message) {
            return true;
        }

        task.creepLimit = task.creepLimit != 1 ? 1 : task.creepLimit;

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return -1; }
        // task creation for the room
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return -1; }
        let record = {
            workRooms: [ room.name, ],
            task: C.SIGNCONTROLLER,
            priority: 99,
            creepLimit: 0,
            managed: true,
        };
        return Game.Queue.work.addRecord(record);
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    printConfig: function(task) {
        if (!task) { return -1; }

        let output = ""
        output += task.name + " task config, id " + task.id + "\n";

        output += "Game.Queue.queue[" + task.id + "].message = " + task.message + "\n";

        output += "Update the records for operation.";

        Console.log(output);
        return true;
    },

};

module.exports = taskMine;
