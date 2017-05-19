/*
 * task Reserve
 *
 * task reserve travels to a room and reserves the controller
 *
 */

var taskReserve = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        if (!creep.room.controller || creep.room.controller.my) {
            return creep.removeWork();
        }

        if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
            let args = {
                range: 1,
                reusePath: 50,
                maxRooms: 1,
                ignoreCreeps: true,
            };
            creep.goto(creep.room.controller, args);
            return true;
        }

        creep.reserveController(creep.room.controller);
        return true;
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

        if (!task.spawnRoom) {
            return true;
        }

        if (Game.Manage.task.cooldown(task)) { return true; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        let room = Game.rooms[task.workRooms[0]];
        if (!room) {
            return true;
        }
        if (!room.controller) {
            Game.Queue.work.delRecord(task.id);
        }

        if (room.controller.reservation &&
            room.controller.reservation.ticksToEnd > C.CONTROLLER_RESERVE_MAX) {
            task.creepLimit = task.creepLimit != 0 ? 0 : task.creepLimit;
        }

        if (!room.controller.reservation || (room.controller.reservation &&
            room.controller.reservation.ticksToEnd < C.CONTROLLER_RESERVE_MIN)) {
            task.creepLimit = task.creepLimit < 1 ? 1 : task.creepLimit;
        }

        // spawn new creeps if needed
        let count = _.filter(Game.creeps, creep =>
            creep.memory.workId == task.id &&
            creep.memory.despawn != true
            ).length;
        if (count >= task.creepLimit) {
            return true;
        }

        if (!Game.Queue.spawn.isQueued({ role: C.CONTROLLER, workId: task.id, })) {
            let record = {
                rooms: [ task.spawnRoom, ],
                role: C.CONTROLLER,
                priority: 70,
                creepArgs: {
                    workRooms: task.workRooms,
                    workId: task.id,
                    style: 'reserve',
                },
            };
            Game.Queue.spawn.addRecord(record);
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
            task: C.RESERVE,
            priority: 70,
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
        output += task.task + " task config, id " + task.id + "\n";

        output += "Game.Queue.queue[" + task.id + "].spawnRoom = '" + task.spawnRoom + "'\n";

        output += "Update the records for operation.";

        console.log(output);
        return true;
    },

};

module.exports = taskReserve;
