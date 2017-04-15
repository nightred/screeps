/*
 * task Harvest
 *
 * harvest task harvestest the minerals from the extractor in the room
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

        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.goto(creep.room.controller, { range: 3, reusePath: 20, maxRooms: 1, });
        }

        return true;
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
        let room = Game.rooms[task.workRooms[0]];
        if (!room) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - no eyes on room: ' + task.workRooms[0] + ', task: ' + task.task + ', id: ' + task.id); }
            return true;
        }

        // set spawn limits
        task.creepLimit = task.creepLimit < 1 ? 1 : task.creepLimit;
        if (room.storage && room.controller.level < 8) {
            if (room.storage.store[RESOURCE_ENERGY] < 100000 ) {
                task.creepLimit = task.creepLimit != 1 ? 1 : task.creepLimit;
            } else if (room.storage.store[RESOURCE_ENERGY] < 300000 ) {
                task.creepLimit = task.creepLimit != 2 ? 2 : task.creepLimit;
            } else if (room.storage.store[RESOURCE_ENERGY] < 500000 ) {
                task.creepLimit = task.creepLimit != 3 ? 3 : task.creepLimit;
            } else if (room.storage.store[RESOURCE_ENERGY] < 800000 ) {
                task.creepLimit = task.creepLimit != 4 ? 4 : task.creepLimit;
            } else {
                task.creepLimit = task.creepLimit != 5 ? 5 : task.creepLimit;
            }
        } else if (room.controller.level == 8 ) {
            task.creepLimit = task.creepLimit != 1 ? 1 : task.creepLimit;
        } else {
            task.creepLimit = task.creepLimit < 2 ? 2 : task.creepLimit;
        }
        if (C.SIM) { task.creepLimit = 1 };

        // spawn new creeps if needed
        let count = _.filter(Game.creeps, creep =>
            creep.memory.workId == task.id &&
            creep.memory.despawn != true
            ).length;
        if (count < task.creepLimit) {
            if (!Game.Queue.spawn.isQueued({ workId: task.id, role: C.HARVESTER, })) {
                let record = {
                    rooms: [ task.spawnRoom, ],
                    role: C.HARVESTER,
                    priority: 60,
                    creepArgs: {
                        workRooms: task.workRooms,
                        workId: task.id,
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

module.exports = taskUpgrade;
