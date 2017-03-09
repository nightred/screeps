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
            if (Constant.DEBUG >= 2) { console.log('DEBUG - miner name:' + creep.name + ' has no harvest target'); }
            return false;
        }
        if (task.workRooms.length <= 0) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let source = Game.getObjectById(creep.memory.harvestTarget);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        task.manageTick = task.manageTick || 0;
        if ((task.manageTick + Constant.MANAGE_WAIT_TICKS) > Game.time) {
            return true;
        }
        task.manageTick = Game.time;

        if (task.creeps.length < task.creepLimit) {
            if (!Game.Queues.spawn.isQueued({ room: task.spawnRoom, role: 'miner', })) {
                let record = {
                    rooms: [ task.spawnRoom, ],
                    role: 'miner',
                    priority: 50,
                    creepArgs: {
                        harvestTarget: task.targetId,
                        workRooms: task.workRooms,
                    },
                };
                Game.Queues.spawn.addRecord(record);
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
