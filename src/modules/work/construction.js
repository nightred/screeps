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
    run: function(creep, task) {
        this.memory = task;

        if (creep.manageState()) {
            if (creep.isWorking()) {
                creep.say('⚙');
            } else {
                creep.say('🔋');
            }
        }

        if (creep.isWorking()) {
            this.doConstuction(creep, task);
        } else {
            this.getEnergy(creep, task);
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doConstuction: function(creep, task) {
        if (creep.room.name != task.workRoom) {
            creep.moveToRoom(task.workRoom);
            return;
        }

        let target = Game.getObjectById(task.targetId);
        if (!target) {
            task.completed = true;
            return;
        }

        if (!creep.pos.inRangeTo(target, 3)) {
            creep.goto(target, {
                range: 1,
                reusePath: 50,
                maxRooms: 1,
                ignoreCreeps: true,
            });
            return;
        }

        creep.build(target);
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
        room.memory.work = room.memory.work || {};

        let memory = room.memory.work;
        if (memory.sleepConstruction && memory.sleepConstruction > Game.time)
            return;
        memory.sleepConstruction = Game.time + C.WORK_FIND_SLEEP;

        let targets = room.getConstructionSites();
        for (var i = 0; i < targets.length; i++) {
            this.create({
                roomName: room.name,
                targetId: targets[i].id,
            });
        }
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        if (getQueueRecord(args.targetId)) return;

        addQueueRecordWork({
            workRoom: args.roomName,
            task: C.WORK_CONSTRUCTION,
            priority: 70,
            creepLimit: 2,
            targetId: args.targetId,
            id: args.targetId,
        });
    },

};

_.merge(taskConstruction, require('lib.containers'));

registerWork(C.WORK_CONSTRUCTION, taskConstruction);
