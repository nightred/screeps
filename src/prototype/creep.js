/*
 * Creep common functions
 *
 * Provides common functions to all creeps
 *
 */

Creep.prototype.moveToRoom = function(name) {
    if (!name) { return -1; }
    if (this.room.name == name) { return true; }
    if (Game.cpu.bucket < 1000) { return true; }
    let target = new RoomPosition(25, 25, name);
    return this.goto(target, { range: 10,  reusePath: 100, ignoreCreeps: true, })
}

Creep.prototype.manageState = function() {
    if (this.carryCapacity == 0) {
        this.memory.working = this.memory.working != true ? true : this.memory.working;
        return false;
    }
    if (this.memory.working && this.isEmpty()) {
        this.memory.working = false;
        return true;
    }
    if (!this.memory.working && this.isFull()) {
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

Creep.prototype.isEmpty = function() {
    return _.sum(this.carry) == 0;
}

Creep.prototype.isFull = function() {
    return _.sum(this.carry) == this.carryCapacity;
}

Creep.prototype.isCarryingEnergy = function() {
    return this.carry.energy > 0;
}

Creep.prototype.isDespawnWarning = function() {
    if (this.memory.despawn) { return true; }
    if (this.memory.role == C.CONTROLLER ||
        this.memory.role == C.SCOUT) {
        return false;
    }
    return this.ticksToLive <= C.CREEP_DESPAWN_TICKS;
}

Creep.prototype.setDespawn = function() {
    this.memory.despawn = true;
    this.memory.goingTo = false;
    this.memory.harvestTarget = false;
    this.leaveWork();
    if (C.DEBUG >= 3) { console.log('VERBOSE - ' + this.memory.role + ' ' + this.name + ' end of life'); }
    return true;
}

Creep.prototype.leaveWork = function() {
    if (!this.memory.workId) { return true; }
    Game.Queue.work.removeCreep(this.name, this.memory.workId);
    this.memory.workId = false;
    return true;
}

Creep.prototype.getWork = function(tasks, args) {
    if (!Array.isArray(tasks)) { return false; }
    args = args || {};

    let list = false;
    if (args.ignoreRoom) {
        list = Game.Queue.work.getWork(tasks, this.name);
    } else if (args.room) {
        list = Work.getWork(tasks, this.name, args);
    } else if (this.memory.workRooms) {
        if (this.memory.workRooms.indexOf(this.room.name) >= 0) {
            args.room = this.room.name;
            list = Game.Queue.work.getWork(tasks, this.name, args);
        }
        if (!list || list.length <= 0) {
            for (let i = 0; i < this.memory.workRooms.length; i++) {
                if (this.memory.workRooms[i] == this.room.name) {
                    continue;
                }
                args.room = this.memory.workRooms[i];
                list = Game.Queue.work.getWork(tasks, this.name, args);
                if (list.length > 0) { break; }
            }
        }
    } else {
        args.room = this.room.name;
        list = Game.Queue.work.getWork(tasks, this.name, args);
    }

    if (!list || list.length <= 0) { return false; }
    let workId = list[0].id;
    this.memory.workId = workId;
    return true;
}

Creep.prototype.doWork = function() {
    if (!this.memory.workId) { return false; }
    if (!Game.Manage.task.doTask(this)) {
        this.leaveWork();
    }
    return true;
}

Creep.prototype.removeWork = function() {
    if (!this.memory.workId) { return false; }
    Game.Queue.work.delRecord(this.memory.workId);
    this.memory.workId = false;
    return true;
}

Creep.prototype.doTransfer = function(target, resourceType) {
    if (!target) {
        this.memory.goingTo = false;
        return -1;
    }
    if (resourceType && RESOURCES_ALL.indexOf(resourceType) < 0) {
        this.memory.goingTo = false;
        return -1;
    }

    if (!this.pos.inRangeTo(target, 1)) {
        let args = {
            range: 1,
            reusePath: 20,
            maxRooms: 1,
            ignoreCreeps: true,
        };
        if (this.memory.role == C.RESUPPLY) {
            args.ignoreCreeps = false;
        }
        this.goto(target, args);
        return false;
    } else {
        this.memory.goingTo = false;
    }

    if (resourceType) {
        this.transfer(target, resourceType);
    } else {
        for (var resource in target.) {
            this.transfer(target, resource);
        }
    }

    return true;
}

Creep.prototype.doWithdraw = function(target, resourceType) {
    if (!target) {
        this.memory.goingTo = false;
        return -1;
    }
    if (resourceType && RESOURCES_ALL.indexOf(resourceType) < 0) {
        this.memory.goingTo = false;
        return -1;
    }

    if (!this.pos.inRangeTo(target, 1)) {
        let args = {
            range: 1,
            reusePath: 20,
            maxRooms: 1,
            ignoreCreeps: true,
        };
        if (this.memory.role == C.RESUPPLY) {
            args.ignoreCreeps = false;
        }
        this.goto(target, args);
        return false;
    } else {
        this.memory.goingTo = false;
    }

    if (resourceType) {
        this.withdraw(target, resourceType);
    } else {
        if (!target.store) {
            this.withdraw(target, RESOURCE_ENERGY);
        } else {
            for (var resource in target.store) {
                this.withdraw(target, resource);
            }
        }
    }

    return true;
}

Creep.prototype.doEmpty = function(types, resourceType) {
    if (!Array.isArray(types)) { return -1; }
    if (resourceType && RESOURCES_ALL.indexOf(resourceType) < 0) {
        return -1;
    }

    if (!this.memory.goingTo) {
        let resourceSum = _.sum(this.carry);
        if (!this.getEmptyTarget(types, resourceSum)) {
            this.memory.idleStart = Game.time;
            this.say('💤');
            return true;
        }
    }

    this.doTransfer(Game.getObjectById(this.memory.goingTo), resourceType);
    return true;
};

Creep.prototype.getEmptyTarget = function(types, resourceSum) {
    if (!Array.isArray(types)) { return -1; }
    if (isNan(resourceSum)) { return -1; }

    let target = Game.Manage.room.storage.getStore(this, resourceSum, types);
    if (target) {
        this.setGoingTo(target);
        return true;
    }

    if (this.room.name != this.memory.spawnRoom) {
        this.moveToRoom(this.memory.spawnRoom);
        return true;
    }

    return false;
};

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

Creep.prototype.hasGoingTo = function(target) {
    return _.filter(this.room.find(FIND_MY_CREEPS), targetCreep =>
        targetCreep.memory.goingTo == target).length > 0 ? true : false;
}

Creep.prototype.goto = function(target, args) {
    if (!target) { return -1; }
    args = args || {};
    this.memory.moveTick = this.memory.moveTick || 0;
    this.memory.x = this.memory.x || 0;
    this.memory.y = this.memory.y || 0;

    if (this.memory._move && (this.memory.moveTick + C.CREEP_STUCK_TICK) < Game.time) {
        delete this.memory._move;
        this.memory.moveTick = Game.time;
        args.ignoreCreeps = false;
        args.reusePath = C.CREEP_STUCK_TICK;
    }

    if (this.memory.x != this.pos.x || this.memory.y != this.pos.y) {
        this.memory.moveTick = Game.time;
        this.memory.x = this.pos.x;
        this.memory.y = this.pos.y;
    }

    this.moveTo(target, args);
};

Creep.prototype.doEmptyEnergy = function(types) {
    if (!Array.isArray(types)) { return -1; }

    if (!this.memory.goingTo) {
        if (!this.getEmptyEnergyTarget(types)) {
            this.memory.idleStart = Game.time;
            this.say('💤');
            return true;
        }
    }

    this.transferEnergy(Game.getObjectById(this.memory.goingTo));
    return true;
};

Creep.prototype.getEmptyEnergyTarget = function(types, args) {
    if (!Array.isArray(types)) { return -1; }
    args = args || {};
    args.setGoingTo = args.setGoingTo || true;

    let target = Game.Manage.room.energyGrid.getStore(this, this.carry[RESOURCE_ENERGY], types);
    if (target) {
        if (args.setGoingTo) {
            this.setGoingTo(target);
        }
        return true;
    }
    if (this.room.name != this.memory.spawnRoom) {
        this.moveToRoom(this.memory.spawnRoom);
        return true;
    }

    return false;
};

Creep.prototype.doFillEnergy = function(types) {
    if (!Array.isArray(types)) { return -1; }

    this.memory.fillTick = this.memory.fillTick || 0;
    if ((this.memory.fillTick + C.CREEP_FILL_TICKS) < Game.time) {
        this.memory.goingTo = false;
    }
    if (!this.memory.goingTo) {
        if (this.getFillEnergyTarget(types)) {
            this.memory.fillTick = Game.time;
        } else {
            this.memory.idleStart = Game.time;
            this.say('💤');
            return true;
        }
    }

    this.withdrawEnergy(Game.getObjectById(this.memory.goingTo));
    return true;
};

Creep.prototype.getFillEnergyTarget = function(types, args) {
    if (!Array.isArray(types)) { return -1; }
    args = args || {};
    args.setGoingTo = args.setGoingTo || true;

    let target = Game.Manage.room.energyGrid.getWithdraw(this, (this.carryCapacity - _.sum(this.carry)), types);
    if (target) {
        if (args.setGoingTo) {
            this.setGoingTo(target);
        }
        return true;
    }
    if (this.room.name != this.memory.spawnRoom &&
        (this.memory.role != C.HAULER && this.memory.style != 'longhauler')) {
        this.moveToRoom(this.memory.spawnRoom);
        return true;
    }

    return false;
};

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

Creep.prototype.getDestructibleStructures = function(path) {
    if (!path || !path.length) { return -1; }

    for (let i = 0; i < path.length; i++) {
        let target = new RoomPosition(path[i].x, path[i].y, this.room.name).look();
        let targetIndex = _.findIndex(target, object =>
            object.structure &&
            object.structure.structureType == STRUCTURE_RAMPART);
        if (targetIndex == -1) {
            targetIndex = _.findIndex(target, object =>
                object.structure &&
                OBSTACLE_OBJECT_TYPES[object.structure.structureType]);
        }
        if (targetIndex >= 0) {
            return target[targetIndex].id;
        }
    }

    return false;
};

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
        if (_.findIndex(target, object =>
            object.type == 'creep' ||
            (object.structure && OBSTACLE_OBJECT_TYPES[object.structure.structureType]) ||
            object.terrain == 'wall'
            ) == -1) {
            this.move(direction);
            if (this.memory._move) {
                delete this.memory._move;
            }
            break;
        }
    }

    return true;
}

Creep.prototype.moveToIdlePosition = function() {
    if (this.isOnRoad() || this.isOnContainer()) {
        let direction = 0;
        while (true) {
            direction = Math.floor(Math.random() * 8) + 1;
            if ((this.pos.x + C.DIRECTIONS[direction][0]) != 0 &&
                (this.pos.y + C.DIRECTIONS[direction][1]) != 0 &&
                (this.pos.x + C.DIRECTIONS[direction][0]) != 49 &&
                (this.pos.y + C.DIRECTIONS[direction][1]) != 49) {
                break;
            }
        }

        return this.move(direction);
    }

    return true;
}

Creep.prototype.isOnRoad = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureRoad) != undefined;
}

Creep.prototype.getOnRoad = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureRoad);
}

Creep.prototype.isOnContainer = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureContainer) != undefined;
}
