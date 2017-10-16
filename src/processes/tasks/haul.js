/*
 * task Haul
 *
 * haul manages the moving of resources
 *
 */

var logger = new Logger('[Task Haul]');

var taskHaul = function() {
    // init
};

_.merge(taskHaul.prototype, require('lib.spawn.creep'));

taskHaul.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom || !this.memory.containerId) {
        logger.debug('removing process missing values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom +
            ', containerId: ' + this.memory.containerId
        );
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doSpawnDetails();
    this.doCreepSpawn();

    for (var i = 0; i < this.memory.creeps.length; i++) {
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

    if (creep.room.name != this.memory.spawnRoom) {
        creep.moveToRoom(this.memory.spawnRoom);
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
    if (creep.room.name !== this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    let container = Game.getObjectById(this.memory.containerId);
    if (!container) {
        logger.debug('container missing killing the process')
        Game.kernel.killProcess(this.pid);
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
    creep.state = 'wait';
};

taskHaul.prototype.manageState = function(creep) {
    if (creep.state == 'init') creep.state = 'wait';

    if (creep.state == 'transfer') {
        this.stateTransferToWait(creep);
    }

    if (creep.state == 'wait') {
        if (this.stateWaitToWithdraw(creep)) return;
        if (this.stateWaitToTransfer(creep)) return;
    }
};

taskHaul.prototype.stateTransferToWait = function(creep) {
    if (creep.isEmpty()) {
        creep.state = 'wait';
        return true;
    }

    if (creep.room.name == this.memory.spawnRoom &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.level < 4 &&
        creep.isEmptyEnergy()
    ) {
        creep.state = 'wait';
        return true;
    }
};

taskHaul.prototype.stateWaitToTransfer = function(creep) {
    if (!creep.isEmpty()) {
        creep.state = 'transfer'
        return true;
    }
};

taskHaul.prototype.stateWaitToWithdraw = function(creep) {
    if (creep.isEmpty()) {
        creep.state = 'withdraw';
        return true;
    }

    if (creep.room.name == this.memory.spawnRoom &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.level < 4 &&
        creep.isEmptyEnergy()
    ) {
        creep.state = 'withdraw';
        return true;
    }
};

taskHaul.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let spawnDetail = {
        role: C.ROLE_HAULER,
        priority: 52,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            style: 'default',
        },
        limit: 1,
    };

    if (this.memory.spawnRoom !== this.memory.workRoom) {
        spawnDetail.creepArgs.style = 'longhauler';
    }

    this.setSpawnDetails(spawnDetail);
};

registerProcess('tasks/haul', taskHaul);
