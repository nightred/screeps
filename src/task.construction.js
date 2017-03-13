/*
 * task Construction
 *
 * construction task handles building structures
 *
 */

var taskConstruction = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (task.workRooms.length <= 0) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let target = Game.getObjectById(task.targetId);
        if (!target) { return creep.removeWork(); }

        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { range: 3, });
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }
        // managed tasks
        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return -1; }

        room.memory.findTickConstruction = room.memory.findTickConstruction || 0;
        if ((room.memory.findTickConstruction + Constant.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTickConstruction = Game.time;

        let targets = room.getConstructionSites();

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (Game.Queues.work.isQueued({ targetId: targets[i].id, })) {
                continue;
            }

            let record = {
                workRooms: [ room.name, ],
                task: 'construction',
                priority: 70,
                creepLimit: 4,
                targetId: targets[i].id,
            };
            Game.Queues.work.addRecord(record);
        }

        return true;
    },

};

module.exports = taskConstruction;
