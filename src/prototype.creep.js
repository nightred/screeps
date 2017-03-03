/*
 * Creep common functions
 *
 * Provides common functions to all creeps
 *
 */

Creep.prototype.moveToRoom = function(name) {
    if (!name) { return -1; }
    if (this.room.name == name) { return true; }
    let target = new RoomPosition(25, 25, name);

    return this.moveTo(target, { range: 23, })
}

Creep.prototype.manageState = function() {
    if (!this.carryCapacity > 0) {
        this.memory.working = true;

        return true;
    }

    if (this.memory.working && this.isEnergyEmpty()) {
        this.memory.working = false;

        return true;
    }
    if (!this.memory.working && this.isEnergyFull()) {
        this.memory.working = true;

        return true;
    }

    return false;
}

Creep.prototype.toggleState = function() {
    if (this.memory.working) {
        this.memory.working = false;
    } else {
        this.memory.working = true;
    }

    return true;
}

Creep.prototype.isEnergyEmpty = function() {
    return this.carry.energy == 0;
}

Creep.prototype.isEnergyFull = function() {
    return this.carry.energy == this.carryCapacity;
}

Creep.prototype.isCarryingEnergy = function() {
    return this.carry.energy > 0;
}

Creep.prototype.isDespawnWarning = function() {
    if (this.memory.despawn) { return true; }

    if (this.memory.role == 'controller') {
        return false;
    }

    return this.ticksToLive < Constant.CREEP_DESPAWN_TICKS;
}

Creep.prototype.setDespawn = function() {
    this.memory.despawn = true;
    this.memory.goingTo = false;
    this.memory.harvestTarget = false;

    this.leaveWork();

    if (Constant.DEBUG >= 3) { console.log('VERBOSE - ' + this.memory.role + ' ' + this.name + ' end of life'); }
}

Creep.prototype.leaveWork = function() {
    if (!this.memory.workId) { return true; }
    Game.Queues.work.removeCreep(this.name, this.memory.workId);
    this.memory.workId = false;

    return true;
}

Creep.prototype.getWork = function(tasks, args) {
    if (!Array.isArray(tasks)) { return false; }
    args = args || {};

    let workId = false;
    if (args.ignoreRoom) {
        workId = Game.Queues.work.getWork(tasks, this.name);
    } else if (args.room) {
        workId = Work.getWork(tasks, this.name, args);
    } else if (this.memory.workRooms) {
        if (this.memory.workRooms.indexOf(this.room.name) >= 0) {
            args.room = this.room.name;
            workId = Game.Queues.work.getWork(tasks, this.name, args);
        }
        if (!workId) {
            for (let i = 0; i < this.memory.workRooms.length; i++) {
                args.room = this.memory.workRooms[i];
                workId = Game.Queues.work.getWork(tasks, this.name, args);
                if (workId) { break; }
            }
        }
    } else {
        args.room = this.room.name;
        workId = Game.Queues.work.getWork(tasks, this.name, args);
    }

    if (!workId) { return false; }
    if (!Game.Queues.work.addCreep(this.name, workId)) { return false; }
    this.memory.workId = workId;

    return true;
}

Creep.prototype.doWork = function() {
    if (!this.memory.workId) { return false; }

    if (!Game.Queues.work.doTask(this)) {
        this.leaveWork();
    }

    return true;
}

Creep.prototype.removeWork = function() {
    if (!this.memory.workId) { return false; }

    Game.Queues.work.delRecord(this.memory.workId);
    this.memory.workId = false;

    return true;
}

Creep.prototype.transferEnergy = function(target) {
    if (!target) {
        this.memory.goingTo = false;
        return false;
    }

    if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(target, { range: 1, reusePath: 10, });
        return false;
    } else {
        this.memory.goingTo = false;
    }

    return true;
}

Creep.prototype.withdrawEnergy = function(target) {
    if (!target) {
        this.memory.goingTo = false;
        return false;
    }

    if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(target, { range: 1, reusePath: 10, });
        return false;
    } else {
        this.memory.goingTo = false;
    }

    return true;
}

Creep.prototype.setGoingTo = function(target, leaveRoom) {
    leaveRoom = typeof leaveRoom !== 'undefined' ? leaveRoom : false;

    if (!target) {
        this.memory.goingTo = false;
        return false;
    }

    if (!leaveRoom && (target.pos.x < 1 || target.pos.y < 1 || target.pos.x > 48 || target.pos.y > 48)) {
        this.memory.goingTo = false;
       return false;
    }

    this.memory.goingTo = target.id;
    return true;
}

Creep.prototype.isGoingToSet = function(target) {
    for (let roomCreep of this.room.find(FIND_MY_CREEPS)) {
        if (roomCreep.memory.goingTo == target.id &&
            roomCreep.memory.role == this.memory.role) {
            return true;
        }
    }
    return false;
}

Creep.prototype.doEmptyEnergy = function(types) {
    if (!Array.isArray(types)) { return -1; }

    if (!this.memory.goingTo) {
        let target = Game.energyNet.getStore(this.room, this.carry[RESOURCE_ENERGY], types);
        if (!target) {
            this.memory.idleStart = Game.time;
            this.say('💤');
            return true;
        }
        this.setGoingTo(target);
    }

    this.transferEnergy(Game.getObjectById(this.memory.goingTo));
    return true;
};

Creep.prototype.doFillEnergy = function(types) {
    if (!Array.isArray(types)) { return -1; }

    if (!this.memory.goingTo) {
        let target = Game.energyNet.getWithdraw(this.room, (this.carrycapacity - _.sum(this.carry), types);
        if (!target) {
            this.memory.idleStart = Game.time;
            this.say('💤');
            return true;
        }
        this.setGoingTo(target);
    }

    this.withdrawEnergy(Game.getObjectById(this.memory.goingTo));
    return true;
};

Creep.prototype.getTargetTowerEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';

    let targets = this.room.getTowers();
    if (!targets.length > 0) { return false; }

    if (useMode == 'store') {
        targets = _.filter(targets, structure =>
            structure.energy < Constant.ENERGY_TOWER_MIN
        );
    } else if (useMode == 'withdraw') {
        targets = _.filter(targets, structure =>
            structure.energy > 0
        );
    }

    return targets;
}

Creep.prototype.getTargetStorageEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';

    let target = this.room.storage;
    if (!target) { return false; }

    if (useMode == 'store' &&
        _.sum(target.store) == target.storeCapacity) {
        return false;
    }
    if (useMode == 'withdraw' &&
        target.store[RESOURCE_ENERGY] < Constant.ENERGY_STORAGE_MIN_WITHDRAW) {
        return false;
    }

    return target;
}

Creep.prototype.getTargetSpawnEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';

    if (useMode == 'withdraw' &&
        this.room.energyAvailable < Constant.ENERGY_ROOM_WITHDRAW_MIN ) {
        return false;
    }

	let targets = this.room.getSpawns();
	if (!targets.length > 0) { return false; }

    if (useMode == 'store') {
        targets = _.filter(targets, structure =>
            structure.energy < structure.energyCapacity
        );
    }
    if (useMode == 'withdraw') {
        targets = _.filter(targets, structure =>
            structure.energy > 0
        );
    }

    return targets;
}

Creep.prototype.getTargetExtentionEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';

    if (useMode == 'withdraw' &&
        this.room.energyAvailable < Constant.ENERGY_ROOM_WITHDRAW_MIN) {
        return false;
    }

    let targets = this.room.getExtensions();
    if (!targets.length > 0) { return false; }

    if (useMode == 'store') {
        targets = _.filter(targets, structure =>
            structure.energy < structure.energyCapacity
        );
    } else if (useMode == 'withdraw') {
        targets = _.filter(targets, structure =>
            structure.energy > 0
        );
    }

    return targets;
}

Creep.prototype.getTargetContainerEnergy = function(useMode, storeType, fillLevel) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';
    storeType = typeof storeType !== 'undefined' ? storeType : 'default';
    fillLevel = typeof fillLevel !== 'undefined' ? fillLevel : false;

    let targets = this.room.getContainers();
    if (!targets.length > 0) { return false; }

    if (storeType == 'in') {
        targets = _.filter(targets, structure => structure.memory.type == 'in');
    } else if (storeType == 'out') {
        targets = _.filter(targets, structure => structure.memory.type == 'out');
    } else if (storeType == 'default') {
        targets = _.filter(targets, structure => structure.memory.type == 'default');
    }

    if (useMode == 'store') {
        targets = _.filter(targets, structure =>
            _.sum(structure.store) < (structure.storeCapacity * Constant.ENERGY_CONTAINER_MAX_PERCENT)
        );
    } else if (useMode == 'withdraw') {
        targets = _.filter(targets, structure =>
            structure.store[RESOURCE_ENERGY] > (structure.storeCapacity * Constant.ENERGY_CONTAINER_MIN_PERCENT)
        );
    }

    if (fillLevel) {
        targets = _.sortBy(targets, structure => structure.store[RESOURCE_ENERGY]);
        if (useMode == 'withdraw') { targets.reverse(); }
    }

    return targets;
}

Creep.prototype.collectDroppedEnergy = function () {
    let targets = _.sortBy(this.room.find(FIND_DROPPED_RESOURCES, {
        filter: resource => resource.resourceType == RESOURCE_ENERGY
    }), resource => this.pos.getRangeTo(resource));

    if (targets.length == 0) { return false; }
    if (this.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
        this.moveTo(targets[0]);
    }

    return true;
}

Creep.prototype.getOffExit = function() {
    let directionFromExit = {
        x: {
            0:  [3, 4, 2],
            49: [7, 8, 6],
        },
        y: {
            0:  [5, 6, 4],
            49: [1, 8, 2],
        },
    }

    let moveDirections = false;
    if (directionFromExit['x'][this.pos.x]) {
        moveDirections = directionFromExit['x'][this.pos.x];
    } else if (directionFromExit['y'][this.pos.y]) {
        moveDirections = directionFromExit['y'][this.pos.y];
    }

    if (!moveDirections) { return false; }

    for (let direction of moveDirections) {
        let target = this.pos.fromDirection(direction).look();
        if (_.findIndex(target, objects =>
            objects.type == 'creep' ||
            (objects.structure && OBSTACLE_OBJECT_TYPES[objects.structure.structureType]) ||
            objects.terrain == 'wall'
            ) == -1) {
            this.move(direction);
            break;
        }
    }

    return true;
}

Creep.prototype.moveToIdlePosition = function() {
    if (this.getOffExit()) { return true; }
    if (this.isOnRoad() || this.isOnContainer()) {
        return this.move(Math.floor(Math.random() * 9)) == 0;
    }

    return true;
}

Creep.prototype.isOnRoad = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureRoad) != undefined;
}

Creep.prototype.isOnContainer = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureContainer) != undefined;
}