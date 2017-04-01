/*
 * task Director Room
 *
 * director room task handles the automation of a spawn room
 *
 */

var taskDirectorRoom = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }
        // run creep task
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
            if (C.DEBUG >= 3) { console.log('VERBOSE - no eyes on room: ' + task.workRooms[0] + ', task: ' + task.task + ', id: ' + task.id); }
            return true;
        }

        if (!Game.Queue.work.isQueued({ room: task.workRooms[0], task: C.DIRECTOR_MINE, })) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_MINE,
                priority: 21,
                creepLimit: 0,
                managed: true,
            };
            Game.Queue.work.addRecord(record);
        }

        if (!Game.Queue.work.isQueued({ room: task.workRooms[0], task: C.DIRECTOR_RESUPPLY, })) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_RESUPPLY,
                priority: 22,
                creepLimit: 0,
                managed: true,
            };
            Game.Queue.work.addRecord(record);
        }

        if (!Game.Queue.work.isQueued({ room: task.workRooms[0], task: C.DIRECTOR_HAUL, })) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_HAUL,
                priority: 23,
                creepLimit: 0,
                managed: true,
            };
            Game.Queue.work.addRecord(record);
        }

        if (!Game.Queue.work.isQueued({ room: task.workRooms[0], task: C.DIRECTOR_TECH, })) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_TECH,
                priority: 24,
                creepLimit: 0,
                managed: true,
            };
            Game.Queue.work.addRecord(record);
        }

        if (!Game.Queue.work.isQueued({ room: task.workRooms[0], task: C.UPGRADE, })) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.UPGRADE,
                priority: 28,
                creepLimit: 1,
                managed: true,
            };
            Game.Queue.work.addRecord(record);
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

module.exports = taskDirectorRoom;
