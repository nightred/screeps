/*
 * task Source
 *
 * harvestes energy from the source
 *
 */

var taskSource = function() {
    // init
};

_.merge(taskSource.prototype, require('lib.spawncreep'));

taskSource.prototype.run = function() {
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
taskSource.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if ((creep.carryCapacity * 0.8) > _.sum(creep.carry) || creep.carryCapacity == 0) {
        this.doWork(creep);
    } else {
        this.doEmpty(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doEmpty = function(creep) {
    let energyTargets = [
        'linkIn',
        'containerIn',
        'spawn',
        'extention',
        'container',
        'containerOut',
        'storage',
    ];

    let source = Game.getObjectById(creep.memory.sourceId);

    if (!creep.memory.goingTo && source) {
        creep.memory.goingTo = source.getLocalContainer();
    }

    creep.doEmpty(energyTargets, RESOURCE_ENERGY);
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doWork = function(creep) {
    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    switch (creep.memory.style) {
    case 'drop':
        this.doDropHarvest(creep);
        break;
    default:
        this.doHarvest(creep);
        break;
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doHarvest = function(creep) {
    let source = Game.getObjectById(creep.memory.sourceId);

    if (!creep.pos.inRangeTo(source, 1)) {
        creep.goto(source, {
            range: 1,
            maxRooms:1,
            reUsePath: 80,
            maxOps: 4000,
            ignoreCreeps: true,
        });

        return;
    }

    if (creep.carry[RESOURCE_ENERGY] > 0 && !source.getLocalContainer()) {
        let construction = creep.room.getConstructionAtArea(source.pos, 1);

        if (construction) {
            creep.build(construction);
            return;
        }
    }

    creep.harvest(source);
};

taskSource.prototype.doDropHarvest = function(creep) {
    let source = Game.getObjectById(creep.memory.sourceId);

    let target = Game.getObjectById(source.getDropContainer());

    if (!target) {
        source.clearContainer();
        creep.doDespawn();
        return;
    }

    if (!creep.pos.isEqualTo(target)) {
        creep.goto(target, {
            range: 0,
            maxRooms:1,
            reUsePath: 80,
            maxOps: 4000,
        });
        return;
    }

    if (_.sum(target.store) >= (target.storeCapacity * C.ENERGY_CONTAINER_MAX_PERCENT)) {
        return;
    }

    creep.harvest(source);
};

registerProcess('tasks/source', taskSource);
