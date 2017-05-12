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
                if (!Game.Queue.spawn.isQueued({ role: C.HAULER, workId: task.id,})) {
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
        let output = task.name + " task created, room: " + task.spawnRoom + ", id: " + task.id;
        Console.log(output);
        return true;
    },

};

module.exports = taskDirectorHaul;
