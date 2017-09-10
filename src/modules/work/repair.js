/*
 * task Repair
 *
 * repair task handles repairing structures
 *
 */

var logger = new Logger('[Work Repair]');
logger.level = C.LOGLEVEL.DEBUG;

var taskRepair = {

    run: function(creep, task) {
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
            return true;
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
            let args = {
                range: 1,
                reusePath: 50,
                maxRooms: 1,
                ignoreCreeps: true,
            };

            creep.goto(target, args);
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

        if (memory.sleepRepair && memory.sleepRepair > Game.time) {
            return;
        }
        memory.sleepRepair = Game.time + C.WORK_FIND_SLEEP;

        let targets = _.sortBy(_.filter(room.find(FIND_MY_STRUCTURES), structure =>
            structure.hits < (structure.hitsMax * C.REPAIR_HIT_WORK_MIN) &&
            structure.structureType != STRUCTURE_RAMPART
            ), structure => structure.hits / structure.hitsMax);

        _.filter(room.find(FIND_STRUCTURES), structure =>
            (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_ROAD) &&
            (structure.structureType != STRUCTURE_WALL &&
            structure.structureType != STRUCTURE_RAMPART) &&
            structure.hits < (structure.hitsMax * C.REPAIR_HIT_WORK_MIN)
            ).forEach(structure => targets.push(structure));

        if (targets.length <= 0) { return; }

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

        return;
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        let record = {
            workRoom: args.roomName,
            task: C.WORK_REPAIR,
            priority: 40,
            creepLimit: 1,
            targetId: args.targetId,
        };

        return addQueueRecordWork(record);
    },

};

registerWork(C.WORK_REPAIR, taskRepair);
