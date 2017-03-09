/*
 * task Repair
 *
 * repair task handles repairing structures
 *
 */

var taskRepair = {

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

        if (target.hits >= Math.floor(target.hitsMax * Constant.REPAIR_HIT_WORK_MAX)) {
            return creep.removeWork();
        }

        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
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

        Memory.world.tasks = Memory.world.tasks || {};
        Memory.world.tasks.repair = Memory.world.tasks.repair || {};
        let mem = Memory.world.tasks.repair;
        mem.findTick = mem.findTick || 0;
        if ((mem.findTick + Constant.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        mem.findTick = Game.time;

        let targets = _.sortBy(_.filter(room.find(FIND_MY_STRUCTURES), structure =>
            structure.hits < (structure.hitsMax * Constant.REPAIR_HIT_WORK_MIN) &&
            structure.structureType != STRUCTURE_RAMPART
            ), structure => structure.hits / structure.hitsMax);
        _.filter(room.find(FIND_STRUCTURES), structure =>
            (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_ROAD) &&
            (structure.structureType != STRUCTURE_WALL &&
            structure.structureType != STRUCTURE_RAMPART) &&
            structure.hits < (structure.hitsMax * Constant.REPAIR_HIT_WORK_MIN)
            ).forEach(structure => targets.push(structure));

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (Game.Queues.work.isQueued({ targetId: targets[i].id, })) {
                continue;
            }

            let record = {
                workRooms: [ room.name, ],
                spawnRoom: room.name,
                task: 'repair',
                priority: 60,
                creepLimit: 1,
                targetId: targets[i].id,
            };
            Game.Queues.work.addRecord(record);
        }

        return true;
    },

};

module.exports = taskRepair;
