/*
 * task Mineral
 *
 * harvest mineral from the extractor
 *
 */

var taskMineral = function() {
    // init
};

_.merge(taskMineral.prototype, require('lib.spawncreep'));

taskMineral.prototype.run = function() {
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
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
        return;
    }

    creep.doTransfer(container);
};

/**
* @param {Creep} creep The creep object
**/
taskMineral.prototype.doWork = function(creep) {
    let mineral = Game.getObjectById(creep.memory.mineralId);

    if (creep.memory.style == 'drop') {
        if (!this.memory.containerId) {
            this.memory.containerId = mineral.getContainer();
        }

        let container = Game.getObjectById(this.memory.containerId);
        if (!container) {
            mineral.clearContainer();
            this.memory.containerId = undefined;
            return;
        }

        if (!creep.pos.isEqualTo(container)) {
            creep.goto(container, {
                range: 0,
                maxRooms:1,
                reUsePath: 80,
            });
            return;
        }

    } else {
        if (!creep.pos.inRangeTo(mineral, 1)) {
            creep.goto(mineral, {
                range: 1,
                reusePath: 30,
                maxRooms: 1,
                ignoreCreeps: true,
            });
            return;
        }
    }

    if (Memory.world.mineralDisable) return;
    if (Game.time % 5 !== 0) return;
    creep.harvest(mineral)
};

registerProcess('tasks/mineral', taskMineral);
