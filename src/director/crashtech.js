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

        if (!task.init) {
            this.printConfig(task);
            task.init = 1;
        }

        if (!task.spawnRoom || task.creepLimit <= 0) {
            return true;
        }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        // spawn new creeps if needed
        let count = _.filter(Game.creeps, creep =>
            creep.memory.directorId == task.id &&
            creep.memory.despawn != true
            ).length;
        if (count < task.creepLimit) {
            if (task.spawnJob && !Game.Queue.getRecord(task.spawnJob)) {
                task.spawnJob = undefined;
            }

            if (!task.spawnJob) {
                let record = {
                    rooms: [ task.spawnRoom, ],
                    role: C.CRASHTECH,
                    priority: 58,
                    creepArgs: {
                        workRooms: task.workRooms,
                        directorId: task.id,
                    },
                };

                task.spawnJob = Game.Queue.spawn.addRecord(record);
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

    /**
    * @param {Room} room The room object
    **/
    createTask: function(args, room) {
        if (!room) { return ERR_INVALID_ARGS; }

        let record = {
            workRooms: [ room, ],
            task: C.DIRECTOR_CRASHTECH,
            priority: 58,
            creepLimit: args[3],
            spawnRoom: args[2],
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
        output += task.task + " task config, id " + task.id + "\n";

        output += "Game.Queue.queue[" + task.id + "].spawnRoom = '" + task.spawnRoom + "'\n";
        output += "Game.Queue.queue[" + task.id + "].creepLimit = " + task.creepLimit + "\n";

        output += "Update the records for operation.";

        console.log(output);
        return true;
    },

};

module.exports = taskDirectorMine;
