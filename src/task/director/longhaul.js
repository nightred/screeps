/*
 * task Director Long Haul
 *
 * director long haul task handles moving energy from remote rooms to spawn room
 *
 */

var taskDirectorLongHaul = {

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

        if (Game.rooms[task.workRooms[0]] && task.creepLimit == 0) {
            let sources = Game.rooms[task.workRooms[0]].getSources().length;
            if (sources == 0 ) {
                Game.Queue.work.delRecord(task.id);
                return false
            }
            task.creepLimit = sources;
        }

        if (!Game.rooms[task.spawnRoom]) { return true; }
        let room = Game.rooms[task.spawnRoom];

        if (!room.controller || !room.controller.my) { return true; }

        switch (room.controller.level) {
            case 1:
            case 2:
            case 3:
                task.minSize = task.minSize != 200 ? 200 : task.minSize;
                task.maxSize = task.maxSize != 300 ? 300 : task.maxSize;
                break;
            case 4:
            case 5:
            case 6:
                task.minSize = task.minSize != 400 ? 400 : task.minSize;
                task.maxSize = task.maxSize != 600 ? 600 : task.maxSize;
                break;
            case 7:
            case 8:
                task.minSize = task.minSize != 500 ? 500 : task.minSize;
                task.maxSize = task.maxSize < 9999 ? 9999 : task.maxSize;
        }

        // spawn new creeps if needed
        let count = _.filter(Game.creeps, creep =>
            creep.memory.workId == task.id &&
            creep.memory.despawn != true
            ).length;
        if (count < task.creepLimit) {
            if (!Game.Queue.spawn.isQueued({ role: C.HAULER, workId: task.id, })) {
                let record = {
                    rooms: [ task.spawnRoom, ],
                    role: C.HAULER,
                    priority: 68,
                    creepArgs: {
                        workRooms: task.workRooms,
                        workId: task.id,
                        style: 'longhauler',
                    },
                };
                if (task.minSize) { record.minSize = task.minSize; }
                if (task.maxSize) { record.maxSize = task.maxSize; }
                Game.Queue.spawn.addRecord(record);
            }
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

module.exports = taskDirectorLongHaul;
