/*
 * task Director Linker
 *
 * director linker task handles spawning of linker creeps
 *
 */

var taskDirectorLinker = {

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

        if (Game.Manage.task.cooldown(task)) { return true; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        let room = Game.rooms[task.workRooms[0]];
        if (!room) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - no eyes on room: ' + task.workRooms[0] + ', task: ' + task.task + ', id: ' + task.id); }
            return true;
        }

        let linksStorage = _.filter(room.getLinks(), structure =>
            structure.memory.type == 'storage');
        if (!room.storage || linksStorage.length <= 0) {
            task.creepLimit = task.creepLimit > 0 ? 0 : task.creepLimit;
        } else {
            task.creepLimit = task.creepLimit < 1 ? 1 : task.creepLimit;

            // spawn new creeps if needed
            count = _.filter(Game.creeps, creep =>
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
                        role: C.LINKER,
                        priority: 49,
                        creepArgs: {
                            workRooms: task.workRooms,
                            directorId: task.id,
                        },
                    };

                    task.spawnJob = Game.Queue.spawn.addRecord(record);
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

    /**
    * @param {Room} room The room object
    **/
    createTask: function(args, room) {
        if (!room) { return ERR_INVALID_ARGS; }

        let record = {
            workRooms: [ room, ],
            spawnRoom: room,
            task: C.DIRECTOR_LINKER,
            priority: 23,
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
        let output = task.task + " task created, room: " + task.spawnRoom + ", id: " + task.id;
        console.log(output);
        return true;
    },

};

module.exports = taskDirectorLinker;
