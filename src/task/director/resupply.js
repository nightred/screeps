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
                if (task.minSize > 200) {
                    task.minSize = 200;
                }
                break;
            case 3:
                if (task.minSize < 300) {
                    task.minSize = 300;
                }
                break;
            case 4:
            case 5:
                if (task.minSize < 400) {
                    task.minSize = 400;
                }
                break;
            case 6:
            case 7:
            case 8:
                if (task.minSize < 600) {
                    task.minSize = 600;
                }
        }

        if (room.storage) {
            task.creepLimit = task.creepLimit < 1 ? 1 : task.creepLimit;

            // spawn new creeps if needed
            count = _.filter(Game.creeps, creep =>
                creep.memory.role == 'resupply' &&
                creep.room.name == room.name &&
                creep.memory.despawn != true
                ).length;
            if (count < task.creepLimit) {
                if (!Game.Queue.spawn.isQueued({ room: task.spawnRoom, role: 'resupply', })) {
                    let record = {
                        rooms: [ task.spawnRoom, ],
                        role: 'resupply',
                        priority: 48,
                        creepArgs: {
                            workRooms: task.workRooms,
                        },
                    };
                    if (task.minSize) { record.minSize = task.minSize; }
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
