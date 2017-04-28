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
                if (!Game.Queue.spawn.isQueued({ role: C.LINKER, directorId: task.id, })) {
                    let record = {
                        rooms: [ task.spawnRoom, ],
                        role: C.LINKER,
                        priority: 49,
                        creepArgs: {
                            workRooms: task.workRooms,
                            directorId: task.id,
                        },
                    };
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

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return -1; }
        let record = {
            workRooms: [ room.name, ],
            spawnRoom: room.name,
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
        let output = task.name + " task created, room: " + task.spawnRoom + ", id: " + task.id;
        Console.log(output);
        return true;
    },

};

module.exports = taskDirectorLinker;
