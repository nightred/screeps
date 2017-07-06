/*
 * task Mineral
 *
 * harvest mineral from the extractor
 *
 */

var taskMineral = {

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

        if (!creep.pos.inRangeTo(mineral, 1)) {
            let args = {
                range: 1,
                reusePath: 30,
                maxRooms: 1,
                ignoreCreeps: true,
            };
            creep.goto(mineral, args);
            return true;
        }

        creep.harvest(mineral)
        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

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
            if (task.spawnJob && !Game.Queue.getRecord(task.spawnJob)) {
                task.spawnJob = undefined;
            }

            if (!task.spawnJob) {
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

                task.spawnJob = Game.Queue.spawn.addRecord(record);
            }
        }

        return true;
    },

};

module.exports = taskMineral;
