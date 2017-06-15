/*
 * task Director Haul
 *
 * director haul task handles spawning of haulers
 *
 */

var taskDirectorHaul = {

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

        // set size limits
        switch (room.controller.level) {
            case 1:
            case 2:
                task.maxSize = task.maxSize != 300 ? 300 : task.maxSize;
                break;
            case 3:
            case 4:
                task.maxSize = task.maxSize != 400 ? 400 : task.maxSize;
                break;
            case 5:
            case 6:
                task.maxSize = task.maxSize != 500 ? 500 : task.maxSize;
                break;
            case 7:
            case 8:
                task.maxSize = task.maxSize < 9999 ? 9999 : task.maxSize;
        }

        task.minSize = task.minSize != 200 ? 200 : task.minSize;

        if (_.filter(room.getContainers(), structure =>
            structure.memory.type == 'in').length <= 0) {
            task.creepLimit = task.creepLimit > 0 ? 0 : task.creepLimit;
        } else {
            let sourceCount = room.getSources().length;
            task.creepLimit = task.creepLimit < sourceCount ? sourceCount : task.creepLimit;

            // spawn new creeps if needed
            let count = _.filter(Game.creeps, creep =>
                creep.memory.workId == task.id &&
                creep.memory.despawn != true
                ).length;
            if (count < task.creepLimit) {
                if (task.spawnJob && !Game.Queue.getRecord(task.spawnJob)) {
                    task.spawnJob = undefined;
                }

                if (!task.spawnJob) {
                    let record = {
                        rooms: [ task.spawnRoom, ],
                        role: C.HAULER,
                        priority: 52,
                        creepArgs: {
                            workRooms: task.workRooms,
                            workId: task.id,
                            style: 'default',
                        },
                    };

                    if (task.minSize) { record.minSize = task.minSize; }
                    if (task.maxSize) { record.maxSize = task.maxSize; }

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
            task: C.DIRECTOR_HAUL,
            priority: 24,
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

module.exports = taskDirectorHaul;
