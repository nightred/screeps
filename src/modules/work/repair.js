/*
 * task Repair
 *
 * repair task handles repairing structures
 *
 */

var logger = new Logger('[Work Repair]');

var taskRepair = {

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
            this.doRepair(creep, task);
        } else {
            this.getEnergy(creep, task);
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doRepair: function(creep, task) {
        if (creep.room.name != task.workRoom) {
            creep.moveToRoom(task.workRoom);
            return;
        }

        let target = Game.getObjectById(task.targetId);
        if (!target) {
            task.completed = true;
            return;
        }

        if (target.hits >= Math.floor(target.hitsMax * C.REPAIR_HIT_WORK_MAX)) {
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

        creep.repair(target);
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
        if (memory.sleepRepair && memory.sleepRepair > Game.time) return;
        memory.sleepRepair = Game.time + C.WORK_FIND_SLEEP;

        this.findMyStructures(room);
        this.findStructures(room);
    },

    /**
    * @param {Room} room The room object
    **/
    findMyStructures: function(room) {
        let targets = _.filter(room.getMyStructures(), structure =>
            structure.hits < (structure.hitsMax * C.REPAIR_HIT_WORK_MIN) &&
            structure.structureType != STRUCTURE_RAMPART
        );

        for (var i = 0; i < targets.length; i++) {
            this.create({
                roomName: room.name,
                targetId: targets[i].id,
            });
        }
    },

    /**
    * @param {Room} room The room object
    **/
    findStructures: function(room) {
        let targets = _.filter(room.getStructures(), structure =>
            (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_ROAD) &&
            structure.hits < (structure.hitsMax * C.REPAIR_HIT_WORK_MIN)
        );

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
            task: C.WORK_REPAIR,
            priority: 40,
            creepLimit: 1,
            targetId: args.targetId,
            id: args.targetId,
        });
    },
};

registerWork(C.WORK_REPAIR, taskRepair);
