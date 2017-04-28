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

        let extractor = Game.getObjectById(creep.extractorId);
        if (!extractor) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - extractor missing in room: ' + creep.room.name + ', creep: ' + creep.name); }
            creep.setDespawn();
            return false;
        }
        if (extractor.cooldown > 0) {
            return true;
        }

        let mineral = Game.getObjectById(creep.mineralId);
        if (!mineral) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - mineral missing in room: ' + creep.room.name + ', creep: ' + creep.name); }
            creep.setDespawn();
            return false;
        }

        if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
            creep.goto(mineral, { range: 1, reusePath: 30, maxRooms: 1, ignoreCreeps: true, });
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

        if (!task.mineralId) {
            let minerals = room.getMinerals();
            if (minerals.length > 0) {
                task.mineralId = task.mineralId != minerals[0].id ? minerals[0].id : task.mineralId;
            } else {
                task.mineralId = task.mineralId ? false : task.mineralId;
                return true;
            }
        }

        if (task.extractorId) {
            if (!Game.getObjectById(task.extractorId)) {
                task.creepLimit = 0;
                task.extractorId = false;
                return true;
            }
        } else {
            let extractors = room.getExtractors();
            if (extractors.length > 0) {
                task.creepLimit = 1;
                task.extractorId = extractors[0].id;
            } else {
                task.creepLimit = 0;
                task.extractorId = false;
                return true;
            }
        }

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
                    priority: 78,
                    creepArgs: {
                        workRooms: task.workRooms,
                        workId: task.id,
                        extractorId: task.extractorId,
                        mineralId: task.mineralId,
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

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return -1; }
        return false;
    },

};

module.exports = taskUpgrade;
