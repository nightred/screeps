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
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

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
            return true;
        }

        let target = Game.getObjectById(task.targetId);

        if (!target) {
            task.completed = true;
            return;
        }

        if (!creep.pos.inRangeTo(target, 3)) {
            let args = {
                range: 1,
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
    * @param {Creep} creep The creep object
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

        creep.doFill(energyTargets, RESOURCE_ENERGY);

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    find: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }

        room.memory.work = room.memory.work || {};

        let memory = room.memory.work;

        if (memory.sleepConstruction && memory.sleepConstruction > Game.time) {
            return true;
        }
        memory.sleepConstruction = Game.time + C.WORK_FIND_SLEEP;

        let targets = room.getConstructionSites();

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (isQueuedWork({ targetId: targets[i].id, })) {
                continue;
            }

            let args = {
                roomName: room.name,
                targetId: targets[i].id,
            };

            this.create(args);
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
