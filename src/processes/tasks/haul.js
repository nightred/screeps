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
        return;
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

    if (creep.memory.working) {
        this.doTransfer(creep);
    } else {
        if (creep.memory.containerId) {
            this.doWithdrawFromContainer(creep);
            return;
        }

        // old method
        if (creep.room.name != creep.memory.workRooms) {
            creep.moveToRoom(creep.memory.workRooms);
            return;
        }

        let energyInTargets = [
            'containerIn',
        ];
        creep.doFill(energyInTargets, RESOURCE_ENERGY);
    }
};

taskHaul.prototype.doTransfer = function(creep) {
    if (creep.getActiveBodyparts(WORK)) {
        if (creep.pos.isOnRoad()) {
            let road = creep.pos.getRoad();
            if (road.hits < (road.hitsMax - 100)) {
                creep.repair(road);
            }
        } else if (creep.pos.isOnConstruction()) {
            creep.build(creep.pos.getConstruction());
        }
    }

    if (creep.room.name != creep.memory.spawnRoom) {
        creep.moveToRoom(creep.memory.spawnRoom);
        return;
    }

    this.doTransferToStorage(creep);
};

taskHaul.prototype.doTransferToStorage = function(creep) {
    let storage = creep.room.storage;

    if (!storage ||
        (creep.room.controller && creep.room.controller.my &&
        creep.room.controller.level < 4) ||
        _.sum(storage.store) >= (storage.storeCapacity * 0.99)
    ) {
        this.doTransferEnergy(creep);
        return;
    }

    creep.doTransfer(storage);
};

taskHaul.prototype.doTransferEnergy = function(creep) {
    let energyTargets = [
        'spawn',
        'extention',
        'containerOut',
        'container',
    ];

    creep.doEmpty(energyTargets, RESOURCE_ENERGY);
};

taskHaul.prototype.doWithdrawFromContainer = function(creep) {
    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    let container = Game.getObjectById(creep.memory.containerId);
    if (!container) return;

    if (_.sum(container.store) < container.storeCapacity * 0.15) return;

    creep.doWithdraw(container);
};

registerProcess('tasks/haul', taskHaul);
