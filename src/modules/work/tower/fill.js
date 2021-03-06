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
    run: function(creep, task) {
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
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doFillTower: function(creep, task) {
        if (creep.room.name != task.workRoom) {
            creep.moveToRoom(task.workRoom);
            return;
        }

        let tower = Game.getObjectById(task.targetId);
        if (!tower) {
            task.completed = true;
            return;
        }

        if (tower.energy >= Math.floor(tower.energyCapacity * C.REFILL_TOWER_MAX)) {
            task.completed = true;
            tower.workTask = undefined;
            return;
        }

        creep.doTransfer(tower, RESOURCE_ENERGY);
    },

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    getEnergy: function(creep, task) {
        if (creep.memory.spawnRoom != creep.room.name) {
            creep.moveToRoom(creep.memory.spawnRoom);
            return;
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

        creep.doFill(energyTargets, RESOURCE_ENERGY);
    },

    /**
    * @param {Room} room The room object
    **/
    find: function(room) {
        if (room.storage &&
            room.storage.store[RESOURCE_ENERGY] < C.WORK_TOWER_FILL_STORAGE_MIN
        ) return;

        let targets = _.filter(room.getTowers(), structure =>
            structure.energy < (structure.energyCapacity * C.REFILL_TOWER_MIN)
        );

        for (var i = 0; i < targets.length; i++) {
            let tower = targets[i];
            if (tower.workTask) continue;

            tower.workTask = this.create({
                roomName: room.name,
                targetId: targets[i].id,
            });
        }
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        let record = {
            workRoom: args.roomName,
            task: C.WORK_TOWER_REFILL,
            priority: 30,
            creepLimit: 1,
            targetId: args.targetId,
        };

        return addQueueRecordWork(record);
    },

};

registerWork(C.WORK_TOWER_REFILL, taskTowerFill);
