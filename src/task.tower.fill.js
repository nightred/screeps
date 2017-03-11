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
        // managed tasks
        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return -1; }

        room.memory.findTickFillTower = room.memory.findTickFillTower || 0;
        if ((room.memory.findTickFillTower + Constant.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTickFillTower = Game.time;

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
                spawnRoom: room.name,
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
