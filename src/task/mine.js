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

        switch (creep.memory.style) {
            case 'drop':
                this.doDropHarvest(creep);
                break;
            default:
                this.doHarvest(creep);
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
            if (!Game.Queue.spawn.isQueued({ role: C.MINER, workId: task.id, })) {
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
                if (source && source.getDropContainer()) {
                    record.creepArgs.style = 'drop';
                } else if (task.spawnRoom != task.workRooms[0]) {
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

    doHarvest: function(creep) {
        if (!creep) { return -1; }
        let source = Game.getObjectById(creep.memory.harvestTarget);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.goto(source, { range: 1, reUsePath: 80, maxOps: 4000, ignoreCreeps: true, });
        }

        return true;
    },

    doDropHarvest: function(creep) {
        if (!creep) { return -1; }
        let source = Game.getObjectById(creep.memory.harvestTarget);
        let target = Game.getObjectById(source.getDropContainer());

        if (!target) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - drop container missing in room: ' + creep.room.name + ', creep: ' + creep.name); }
            source.clearContainer();
            creep.setDespawn();
            return false;
        }

        if (!creep.memory.atSource) {
            if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
                creep.memory.atSource = true;
            } else {
                creep.moveTo(target.pos.x, target.pos.y, { range: 0, reUsePath: 80, maxOps: 4000, ignoreCreeps: true, });
                return true;
            }
        }

        if (_.sum(target.store) >= (target.storeCapacity * C.ENERGY_CONTAINER_MAX_PERCENT)) {
            return true;
        }

        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            if (C.DEBUG >= 2) { console.log('DEBUG - miner ' + creep.name + ' not in range of ' + source.id); }
            return false;
        }

        return true;
    },

};

module.exports = taskMine;
