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

        if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { reusePath: 50, range: 1, });
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        task.manageTick = task.manageTick || 0;
        if ((task.manageTick + C.MANAGE_WAIT_TICKS) > Game.time) {
            return true;
        }
        task.manageTick = Game.time;

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        let room = Game.rooms[task.workRooms[0]];
        if (!room) {
            return true;
        }
        if (!room.controller) {
            Game.Queues.work.delRecord(task.id);
        }

        if (room.controller.reservation &&
            room.controller.reservation.ticksToEnd > C.CONTROLLER_RESERVE_MAX) {
            task.creepLimit = task.creepLimit != 0 ? 0 : task.creepLimit;
        }

        if (!room.controller.reservation || (room.controller.reservation &&
            room.controller.reservation.ticksToEnd < C.CONTROLLER_RESERVE_MIN)) {
            task.creepLimit = task.creepLimit < 2 ? 2 : task.creepLimit;
        }

        if (task.creeps.length >= task.creepLimit) {
            return true;
        }

        if (!Game.Queues.spawn.isQueued({ room: task.spawnRoom, role: 'controller', })) {
            let record = {
                rooms: [ task.spawnRoom, ],
                role: 'controller',
                priority: 70,
                creepArgs: {
                    workRooms: task.workRooms,
                },
            };
            Game.Queues.spawn.addRecord(record);
        }

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

module.exports = taskReserve;
