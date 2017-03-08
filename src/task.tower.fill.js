/*
 * task Tower Fill
 *
 * tower fill task handles filling toweres with energy
 *
 */

var taskTowerFill = {

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

        if (target.energy >= Math.floor(target.energyCapacity * Constant.REFILL_TOWER_MAX)) {
            return creep.removeWork();
        }

        creep.transferEnergy(target);

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

        // managed tasks
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

        let targets = _.filter(room.getTowers(), structure =>
                structure.energy < (structure.energyCapacity * Constant.REFILL_TOWER_MIN)
                );

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (Game.Queues.work.isQueued({ targetId: targets[i].id, })) {
                continue;
            }

            let record = {
                workRooms: [ room.name, ],
                spawnRooms: [ room.name, ],
                task: 'tower.fill',
                priority: 30,
                creepLimit: 1,
                targetId: targets[i].id,
            };
            Game.Queues.work.addRecord(record);
        }

        return true;
    },
};

module.exports = taskTowerFill;
