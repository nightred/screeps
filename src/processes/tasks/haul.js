/*
 * task Haul
 *
 * haul manages the moving of resources
 *
 */

var taskHaul = function() {
    // init
};

_.merge(taskHaul.prototype, require('lib.spawncreep'));

taskHaul.prototype.run = function() {
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
taskHaul.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    this.manageState(creep);
    if (creep.state == 'transfer') {
        this.doTransfer(creep);
    } else if (creep.state == 'withdraw') {
        this.doWithdraw(creep);
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

    let storage = creep.room.storage;
    if (!storage ||
        (creep.room.controller && creep.room.controller.my &&
        creep.room.controller.level < 4) ||
        _.sum(storage.store) >= (storage.storeCapacity * 0.99)
    ) {
        creep.doEmpty([
            'spawn',
            'extention',
            'containerOut',
            'container',
        ], RESOURCE_ENERGY);
        return;
    }

    creep.doTransfer(storage);
};

taskHaul.prototype.doWithdraw = function(creep) {
    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    if (creep.memory.containerId) {
        this.doWithdrawFromContainer(creep);
        return;
    }

    creep.doFill([ 'containerIn', ]);
};

taskHaul.prototype.doWithdrawFromContainer = function(creep) {
    let container = Game.getObjectById(creep.memory.containerId);
    if (!container) {
        creep.memory.containerId = undefined;
        return;
    }

    if (!creep.pos.inRangeTo(container, 1)) {
        creep.goto(container, {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
            ignoreCreeps: true,
        });
        return;
    }

    creep.doWithdraw(container);
};

taskHaul.prototype.manageState = function(creep) {
    if (creep.state == 'init') {
        creep.state = 'withdraw';
        return;
    }

    if (creep.state == 'withdraw' && this.stateTransfer(creep)) return;
    if (creep.state == 'transfer' && this.stateWithdraw(creep)) return;
};

taskHaul.prototype.stateTransfer = function(creep) {
    if (creep.isFull() || !creep.isEmptyEnergy()) {
        creep.state = 'transfer'
        return true;
    }

    if (creep.room.name == creep.memory.spawnRoom &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.level >= 6 &&
        !creep.isEmpty()
    ) {
        creep.state = 'transfer'
        return true;
    }

    if (creep.memory.containerId) {
        let container = Game.getObjectById(creep.memory.containerId);
        if (!container) return;

        if (_.sum(container.store) === 0 && !creep.isEmpty()) {
            creep.state = 'transfer'
            return true;
        }
    }
};

taskHaul.prototype.stateWithdraw = function(creep) {
    if (creep.isEmpty()) {
        creep.state = 'withdraw'
        return true;
    }

    if (creep.room.name == creep.memory.spawnRoom &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.level < 4 &&
        creep.isEmptyEnergy()
    ) {
        creep.state = 'withdraw'
        return true;
    }
};

registerProcess('tasks/haul', taskHaul);
