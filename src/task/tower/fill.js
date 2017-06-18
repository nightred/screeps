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
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (creep.manageState()) {
            if (creep.isWorking()) {
                creep.say('⚙');
            } else {
                creep.say('🔋');
            }
        }

        if (creep.isWorking()) {
            this.doFillTower(creep, task);
        } else {
            this.getEnergy(creep, task);
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doFillTower: function(creep, task) {
        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let target = Game.getObjectById(task.targetId);

        if (!target) {
            return creep.removeWork();
        }

        if (target.energy >= Math.floor(target.energyCapacity * C.REFILL_TOWER_MAX)) {
            return creep.removeWork();
        }

        creep.doTransfer(target, RESOURCE_ENERGY);

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    getEnergy: function(creep, task) {
        if (creep.memory.spawnRoom != creep.room.name) {
            creep.moveToRoom(creep.memory.spawnRoom);
            return true;
        }

        let energyTargets = [
            'linkOut',
            'storage',
            'containerOut',
            'container',
            'containerIn',
        ];

        if (!creep.room.storage) {
            energyTargets.push('extention');
            energyTargets.push('spawn');
        }

        if (!creep.doFill(energyTargets, RESOURCE_ENERGY)) {
            if (C.DEBUG >= 2) { console.log('DEBUG - do fill energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
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

        room.memory.findTickFillTower = room.memory.findTickFillTower || 0;
        if ((room.memory.findTickFillTower + C.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTickFillTower = Game.time;

        let storage = room.storage;
        if (storage) {
            let minEnergy = storage.storeCapacity * C.ENERGY_STORAGE_MIN_FILL_TOWER;
            if (storage.store[RESOURCE_ENERGY] < minEnergy) {
                return true;
            }
        }

        let targets = _.filter(room.getTowers(), structure =>
                structure.energy < (structure.energyCapacity * C.REFILL_TOWER_MIN)
                );

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (Game.Queue.work.isQueued({ targetId: targets[i].id, })) {
                continue;
            }

            let record = {
                workRooms: [ room.name, ],
                spawnRoom: room.name,
                task: C.TOWER_REFILL,
                priority: 30,
                creepLimit: 1,
                targetId: targets[i].id,
            };
            Game.Queue.work.addRecord(record);
        }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(args, room) {
        return false;
    },

};

module.exports = taskTowerFill;
