/*
 * task Mineral
 *
 * harvest mineral from the extractor
 *
 */

var taskMineral = function() {
    // init
};

taskMineral.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];
    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) return;

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    if (0 === _.sum(creep.carry) || creep.carryCapacity == 0) {
        this.doWork(creep);
    } else {
        this.doEmpty(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doEmpty = function(creep) {
    if (!this.memory.containerId) {
        let mineral = Game.getObjectById(creep.memory.mineralId);
        this.memory.containerId = mineral.getContainer();
    }

    let container = Game.getObjectById(this.memory.containerId);
    if (!container) {
        let mineral = Game.getObjectById(creep.memory.mineralId);
        mineral.clearContainer();
        this.memory.containerId = undefined;
    }

    creep.doTransfer(container);
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doWork = function(creep) {
    if (Game.time % 5 !== 0) return;

    let mineral = Game.getObjectById(creep.memory.mineralId);
    if (!creep.pos.inRangeTo(mineral, 1)) {
        creep.goto(mineral, {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
            ignoreCreeps: true,
        });
        return;
    }

    creep.harvest(mineral)
};

registerProcess('tasks/mineral', taskMineral);
