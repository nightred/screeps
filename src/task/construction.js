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
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let target = Game.getObjectById(task.targetId);
        if (!target) { return creep.removeWork(); }

        if (!creep.pos.inRangeTo(target, 3)) {
            let args = {
                range: 3,
                reusePath: 50,
                maxRooms: 1,
                ignoreCreeps: true,
            };
            creep.goto(target, args);
            return true;
        }

        creep.build(target)
        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }
        // managed tasks
        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }

        room.memory.findTickConstruction = room.memory.findTickConstruction || 0;
        if ((room.memory.findTickConstruction + C.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTickConstruction = Game.time;

        let targets = room.getConstructionSites();

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (Game.Queue.work.isQueued({ targetId: targets[i].id, })) {
                continue;
            }

            let record = {
                workRooms: [ room.name, ],
                task: C.CONSTRUCTION,
                priority: 70,
                creepLimit: 4,
                targetId: targets[i].id,
            };
            Game.Queue.work.addRecord(record);
        }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }
        return false;
    },

};

module.exports = taskConstruction;
