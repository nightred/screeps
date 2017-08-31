/*
 * task Haul
 *
 * haul manages the moving of resources
 *
 */

var taskHaul = function() {
    // init
};

taskHaul.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
    }

    if (creep.getOffExit()) {
        return;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.manageState()) {
        if (creep.memory.working) {
            creep.say('🚚');
        } else {
            creep.say('🔋');
        }
    } else if (!creep.memory.working && creep.carry.energy > (creep.carryCapacity * 0.2))  {
        creep.toggleState();
        creep.say('🚚');
    }

    switch (creep.memory.style) {
    case 'longhauler':
        this.doLongHaul(creep);
        break;
    default:
        this.doHaul(creep);
        break;
    }
};

/**
* @param {Creep} creep The creep object
**/
taskHaul.prototype.doLongHaul = function(creep) {
    if (Game.cpu.bucket < 1000) {
        return;
    }

    if (creep.memory.working) {
        if (creep.pos.isOnRoad()) {
            let road = creep.pos.getRoad();
            if (road.hits < (road.hitsMax - 100)) {
                creep.repair(road);
            }
        } else if (creep.pos.isOnConstruction()) {
            creep.build(creep.pos.getConstruction());
        }

        if (creep.room.name != creep.memory.spawnRoom) {
            creep.moveToRoom(creep.memory.spawnRoom);
            return;
        }

        let energyOutTargets = [
            'storage',
            'spawn',
            'extention',
        ];

        if (!creep.room.storage ||
            (creep.room.controller && creep.room.controller.my &&
            creep.room.controller.level < 4)) {
            energyOutTargets.push('containerOut');
            energyOutTargets.push('container');
        }

        creep.doEmpty(energyOutTargets, RESOURCE_ENERGY);
    } else {
        if (creep.room.name != creep.memory.workRoom) {
            creep.moveToRoom(creep.memory.workRoom);
            return;
        }

        let energyInTargets = [
            'containerIn',
        ];

        creep.doFill(energyInTargets, RESOURCE_ENERGY);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskHaul.prototype.doHaul = function(creep) {
    // working has energy, else need energy
    if (creep.memory.working) {
        let energyOutTargets = [
            'spawn',
            'storage',
        ];

        if (!creep.room.storage ||
            (creep.room.controller && creep.room.controller.my &&
            creep.room.controller.level < 4)) {
            energyOutTargets = [
                'extention',
                'spawn',
                'containerOut',
                'container',
            ];
        }

        creep.doEmpty(energyOutTargets, RESOURCE_ENERGY);
    } else {
        let energyInTargets =  [
            'containerIn',
        ];

        creep.doFill(energyInTargets, RESOURCE_ENERGY);
    }
};

registerProcess('tasks/haul', taskHaul);
