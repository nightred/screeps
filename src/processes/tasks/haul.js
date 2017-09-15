/*
 * task Haul
 *
 * haul manages the moving of resources
 *
 */

var taskHaul = function() {
    // init
};

Object.defineProperty(taskHaul.prototype, 'state', {
    get: function() {
        this.memory.state = this.memory.state || 'init';
        return this.memory.state;
    },
    set: function(value) {
        this.memory.state = value;
    },
});

taskHaul.prototype.run = function() {
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

    this.manageState(creep);
    if (this.state == 'transfer') {
        this.doTransfer(creep);
    } else if (this.state == 'withdraw') {
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
    if (creep.memory.containerId) {
        this.doWithdrawFromContainer(creep);
        return;
    }

    // old method
    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    creep.doFill([ 'containerIn', ], RESOURCE_ENERGY);
};

taskHaul.prototype.doWithdrawFromContainer = function(creep) {
    if (creep.room.name != creep.memory.workRooms) {
        creep.moveToRoom(creep.memory.workRooms);
        return;
    }

    let container = Game.getObjectById(creep.memory.containerId);
    if (!container) return;

    if (!creep.pos.inRangeTo(container, 1)) {
        creep.goto(container, {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
            ignoreCreeps: true,
        });
        return;
    }

    if (_.sum(container.store) < container.storeCapacity * 0.15) {
        creep.sleep();
        return;
    }

    creep.doWithdraw(container);
};

taskHaul.prototype.manageState = function(creep) {
    if (this.state == 'init') this.state = 'withdraw';

    if (this.state == 'withdraw') {
        if (creep.isFull()) {
            this.state = 'transfer'
            return;
        }

        if (creep.memory.containerId) {
            let container = Game.getObjectById(creep.memory.containerId);
            if (!container) return;
            if (creep.room.controller &&
                creep.room.controller.my &&
                creep.room.controller.level < 4 &&
                container.store[RESOURCE_ENERGY] === 0
            ) {
                this.state = 'transfer'
                return;
            }

            if (_.sum(container.store) === 0) {
                this.state = 'transfer'
                return;
            }
        }

        return;
    }

    if (this.state == 'transfer') {
        if (creep.isEmpty()) {
            this.state = 'withdraw'
            return;
        }

        if (creep.room.controller &&
            creep.room.controller.my &&
            creep.room.controller.level < 4 &&
            creep.isEmptyEnergy()
        ) {
            this.state = 'withdraw'
            return;
        }

        return;
    }
};

registerProcess('tasks/haul', taskHaul);
