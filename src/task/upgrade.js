/*
 * task Upgrade
 *
 * upgrade task upgrades the room controller
 *
 */

var taskUpgrade = {

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

        if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
            let args = {
                range: 1,
                reusePath: 30,
                maxRooms: 1,
            };
            creep.goto(creep.room.controller, args);
            return true;
        }

        creep.upgradeController(creep.room.controller)
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
                task.minSize = task.minSize < 200 ? 200 : task.minSize;
                break;
            case 3:
                task.minSize = task.minSize < 300 ? 300 : task.minSize;
                break;
            case 4:
            case 5:
                task.minSize = task.minSize < 400 ? 400 : task.minSize;
                break;
            case 6:
            case 7:
            case 8:
                task.minSize = task.minSize < 600 ? 600 : task.minSize;
                break;
        }

        // set spawn limits
        let creepLimit = 1;
        if (room.storage && room.controller.level < 8) {
            if (room.storage.store[RESOURCE_ENERGY] < 50000 ) {
                creepLimit = 1;
            } else if (room.storage.store[RESOURCE_ENERGY] < 80000 ) {
                creepLimit = 2;
            } else if (room.storage.store[RESOURCE_ENERGY] < 150000 ) {
                creepLimit = 3;
            } else if (room.storage.store[RESOURCE_ENERGY] < 200000 ) {
                creepLimit = 4;
            } else if (room.storage.store[RESOURCE_ENERGY] >= 200000 ) {
                creepLimit = 5;
            }
        } else if (room.controller.level == 8 ) {
            creepLimit = 1;
            task.rcl8 = task.rcl8 ? task.rcl8 : 1;
        } else {
            creepLimit = 2;
        }
        if (C.SIM) { creepLimit = 1; };

        task.creepLimit = task.creepLimit != creepLimit ? creepLimit : task.creepLimit;

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
                    role: C.UPGRADER,
                    priority: 60,
                    creepArgs: {
                        workRooms: task.workRooms,
                        workId: task.id,
                    },
                };

                if (task.minSize) { record.minSize = task.minSize; }
                if (task.rcl8) { record.creepArgs.style = 'rcl8'; }

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
            spawnRoom: room,
            task: C.UPGRADE,
            priority: 28,
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

module.exports = taskUpgrade;
