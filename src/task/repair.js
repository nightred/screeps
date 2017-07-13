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
            this.doRepair(creep, task);
        } else {
            this.getEnergy(creep, task);
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doRepair: function(creep, task) {
        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let target = Game.getObjectById(task.targetId);

        if (!target) {
            return creep.removeWork();
        }

        if (target.hits >= Math.floor(target.hitsMax * C.REPAIR_HIT_WORK_MAX)) {
            return creep.removeWork();
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

        creep.repair(target)

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
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }
        // managed tasks
        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }

        room.memory.findTickRepair = room.memory.findTickRepair || 0;
        if ((room.memory.findTickRepair + C.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTickRepair = Game.time;

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

        if (targets.length <= 0) { return true; }

        for (let i = 0; i < targets.length; i++) {
            if (Game.Queue.work.isQueued({ targetId: targets[i].id, })) {
                continue;
            }

            let record = {
                workRooms: [ room.name, ],
                task: C.REPAIR,
                priority: 40,
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

module.exports = taskRepair;
