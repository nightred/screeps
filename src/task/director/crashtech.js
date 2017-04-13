/*
 * task Director Tech
 *
 * director tech task handles the spwning od tech units
 *
 */

var taskDirectorMine = {

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

        for (let i = 0; i < task.workRooms.length; i++ ) {
            if (!Game.rooms[task.workRooms[i]]) { continue; }
            let room = Game.rooms[task.workRooms[i]];

            let remoteTasks = [
                C.REPAIR,
                C.CONSTRUCTION,
            ];
            Game.Queue.work.doTaskFind(room, remoteTasks);
        }

        // spawn new creeps if needed
        let count = _.filter(Game.creeps, creep =>
            creep.memory.directorId == task.id &&
            creep.memory.despawn != true
            ).length;
        if (count < task.creepLimit) {
            if (!Game.Queue.spawn.isQueued({ room: task.spawnRoom, role: C.CRASHTECH, directorId: task.id, })) {
                let record = {
                    rooms: [ task.spawnRoom, ],
                    role: C.CRASHTECH,
                    priority: 58,
                    creepArgs: {
                        workRooms: task.workRooms,
                        directorId: task.id,
                    },
                };
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

module.exports = taskDirectorMine;
