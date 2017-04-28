/*
 * task Claim
 *
 * task claim travels to a room and claims the controller
 *
 */

var taskClaim = {

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

        if (!creep.room.controller || creep.room.controller.my) {
            return creep.removeWork();
        }

        if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.goto(creep.room.controller, { reusePath: 50, range: 1, ignoreCreeps: true, });
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

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return -1; }
        let record = {
            workRooms: [ room.name, ],
            task: C.CLAIM,
            priority: 40,
            creepLimit: 1,
        };
        return Game.Queue.work.addRecord(record);
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    printConfig: function(task) {
        if (!task) { return -1; }
        let output = task.name + " task created, room: " + task.spawnRoom + ", id: " + task.id;
        Console.log(output);
        return true;
    },

};

module.exports = taskClaim;
