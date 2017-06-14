/*
 * task Director Room
 *
 * director room task handles the automation of a spawn room
 *
 */

var taskDirectorRoom = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }
        // run creep task
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }

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

        task.taskDirectorMine = task.taskDirectorMine || 0;
        if (!Game.Queue.getRecord(task.taskDirectorMine)) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_MINE,
                priority: 21,
                creepLimit: 0,
                managed: true,
            };
            task.taskDirectorMine = Game.Queue.work.addRecord(record);
        }

        task.taskDirectorResupply = task.taskDirectorResupply || 0;
        if (!Game.Queue.getRecord(task.taskDirectorResupply)) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_RESUPPLY,
                priority: 22,
                creepLimit: 0,
                managed: true,
            };
            task.taskDirectorResupply = Game.Queue.work.addRecord(record);
        }

        task.taskDirectorLinker = task.taskDirectorLinker || 0;
        if (!Game.Queue.getRecord(task.taskDirectorLinker)) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_LINKER,
                priority: 23,
                creepLimit: 0,
                managed: true,
            };
            task.taskDirectorLinker = Game.Queue.work.addRecord(record);
        }

        task.taskDirectorHaul = task.taskDirectorHaul || 0;
        if (!Game.Queue.getRecord(task.taskDirectorHaul)) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_HAUL,
                priority: 24,
                creepLimit: 0,
                managed: true,
            };
            task.taskDirectorHaul = Game.Queue.work.addRecord(record);
        }

        task.taskDirectorTech = task.taskDirectorTech || 0;
        if (!Game.Queue.getRecord(task.taskDirectorTech)) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.DIRECTOR_TECH,
                priority: 26,
                creepLimit: 0,
                managed: true,
            };
            task.taskDirectorTech = Game.Queue.work.addRecord(record);
        }

        task.taskDirectorUpgrade = task.taskDirectorUpgrade || 0;
        if (!Game.Queue.getRecord(task.taskDirectorUpgrade)) {
            let record = {
                workRooms: [ task.workRooms[0], ],
                spawnRoom: task.spawnRoom,
                task: C.UPGRADE,
                priority: 28,
                creepLimit: 1,
                managed: true,
            };
            task.taskDirectorUpgrade = Game.Queue.work.addRecord(record);
        }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }
        // task creation for the room
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }
        let record = {
            workRooms: [ room, ],
            spawnRoom: room,
            task: C.DIRECTOR_ROOM,
            priority: 20,
            creepLimit: 0,
            managed: true,
        };
        return Game.Queue.work.addRecord(record);
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    printConfig: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }
        let output = task.task + " task created, room: " + task.spawnRoom + ", id: " + task.id;
        console.log(output);
        return true;
    },

};

module.exports = taskDirectorRoom;
