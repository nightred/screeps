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

        if (!task.init) {
            this.printConfig(task);
            task.init = 1;
        }

        if (!task.spawnRoom || task.creepLimit <= 0) {
            return true;
        }

        if (Game.Manage.task.cooldown(task)) { return true; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
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

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return -1; }
        let record = {
            workRooms: [ room.name, ],
            task: C.DIRECTOR_LONGHAUL,
            priority: 40,
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

        let output = ""
        output += task.name + " task config, id " + task.id + "\n";

        output += "Game.Queue.queue[" + task.id + "].workRooms = [" + task.workRooms + "]\n";
        output += "Game.Queue.queue[" + task.id + "].spawnRoom = '" + task.spawnRoom + "'\n";
        output += "Game.Queue.queue[" + task.id + "].creepLimit = " + task.creepLimit + "\n";

        output += "Update the records for operation.";

        Console.log(output);
        return true;
    },

};

module.exports = taskDirectorLongHaul;
