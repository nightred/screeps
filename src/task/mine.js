/*
 * task Mine
 *
 * mine task harvestes the source for energy
 *
 */

var taskMine = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (!creep.memory.harvestTarget) {
            if (C.DEBUG >= 2) { console.log('DEBUG - miner name:' + creep.name + ' has no harvest target'); }
            return false;
        }
        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let source = Game.getObjectById(creep.memory.harvestTarget);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.goto(source, { range: 1, reUsePath: 80, maxOps: 4000, ignoreCreeps: true, });
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

        let count = _.filter(Game.creeps, creep =>
            creep.memory.workId == task.id &&
            creep.memory.despawn != true
            ).length;
        if (count < task.creepLimit) {
            if (!Game.Queue.spawn.isQueued({ room: task.spawnRoom, role: C.MINER, })) {
                let record = {
                    rooms: [ task.spawnRoom, ],
                    role: C.MINER,
                    priority: 50,
                    creepArgs: {
                        harvestTarget: task.targetId,
                        workRooms: task.workRooms,
                        workId: task.id,
                    },
                };
                let source = Game.getObjectById(task.targetId);
                //if (source && source.getContainerAtRange(1)) {
                //    record.creepArgs.style = 'drop';
                //} else 
                if (task.spawnRoom != task.workRooms[0]) {
                    record.creepArgs.style = 'ranged';
                }
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

module.exports = taskMine;
