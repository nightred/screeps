/*
 * task Director Resupply
 *
 * director resupply task handles spawning of resupply creeps
 *
 */

var taskDirectorResupply = {

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

        // set size limits
        switch (room.controller.level) {
            case 1:
            case 2:
                task.maxSize = task.maxSize != 300 ? 300 : task.maxSize;
                break;
            case 3:
                task.maxSize = task.maxSize != 400 ? 400 : task.maxSize;
                break;
            case 4:
            case 5:
            case 6:
                task.maxSize = task.maxSize != 500 ? 500 : task.maxSize;
                break;
            case 7:
            case 8:
                task.maxSize = task.maxSize < 9999 ? 9999 : task.maxSize;
        }

        task.minSize = task.minSize != 200 ? 200 : task.minSize;

        if (room.storage) {
            task.creepLimit = task.creepLimit != 2 ? 2 : task.creepLimit;

            // spawn new creeps if needed
            count = _.filter(Game.creeps, creep =>
                creep.memory.role == C.RESUPPLY &&
                creep.room.name == room.name &&
                creep.memory.despawn != true
                ).length;
            if (count < task.creepLimit) {
                if (!Game.Queue.spawn.isQueued({ role: C.RESUPPLY, directorId: task.id, })) {
                    let record = {
                        rooms: [ task.spawnRoom, ],
                        role: C.RESUPPLY,
                        priority: 10,
                        creepArgs: {
                            workRooms: task.workRooms,
                            directorId: task.id,
                        },
                    };
                    if (task.minSize) { record.minSize = task.minSize; }
                    if (task.maxSize) { record.maxSize = task.maxSize; }
                    Game.Queue.spawn.addRecord(record);
                }
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

module.exports = taskDirectorResupply;
