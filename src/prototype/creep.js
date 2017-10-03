/*
 * Creep common functions
 *
 * Provides common functions to all creeps
 *
 */

Object.defineProperty(Creep.prototype, 'state', {
    get: function() {
        this.memory.state = this.memory.state || 'init';
        return this.memory.state;
    },
    set: function(value) {
        this.memory.state = value;
    },
});

Creep.prototype.moveToRoom = function(roomName) {
    if (Game.cpu.bucket < 1000) { return true; }

    let target = new RoomPosition(25, 25, roomName);
    return this.goto(target, {
        range: 24,
        reusePath: 50,
        ignoreCreeps: true,
    });
}

Creep.prototype.manageState = function() {
    this.memory.working = this.memory.working || false;

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

Creep.prototype.isWorking = function() {
    return this.memory.working;
}

Creep.prototype.isEmpty = function() {
    return _.sum(this.carry) == 0;
}

Creep.prototype.isEmptyEnergy = function() {
    return this.carry[RESOURCE_ENERGY] === 0;
}

Creep.prototype.isFull = function() {
    return _.sum(this.carry) == this.carryCapacity;
}

Creep.prototype.isCarryingEnergy = function() {
    return this.carry.energy > 0;
}

Creep.prototype.isSleep = function() {
    return this.memory.sleep > Game.time;
};

Creep.prototype.sleep = function() {
    this.memory.sleep = C.CREEP_IDLE_TIME + Game.time;
};

Creep.prototype.isDespawnWarning = function() {
    if (this.memory.despawn) { return true; }
    if (this.memory.role == C.ROLE_CONTROLLER ||
        this.memory.role == C.ROLE_SCOUT) {
        return false;
    }

    return this.ticksToLive <= C.CREEP_DESPAWN_TICKS;
}

Creep.prototype.doDespawn = function() {
    if (!this.memory.despawn) {
        this.memory.despawn = true;
        this.memory.goingTo = false;

        this.leaveWork();

        if (this.memory.pid) {
            Game.kernel.killProcess(this.memory.pid);
        }
    }

    this.getOffExit()
};

Creep.prototype.hasWork = function() {
    return !!this.memory.workId;
}

Creep.prototype.leaveWork = function() {
    if (!this.memory.workId) return;
    workRemoveCreep(this.name, this.memory.workId);
    this.memory.workId = undefined;
}

Creep.prototype.getWork = function(workTasks, args = {}) {
    if (!Array.isArray(workTasks)) return ERR_INVALID_ARGS;

    if (!args.ignoreRoom && !args.spawnRoom && !args.room && !args.rooms) {
        if (this.memory.workRoom) {
            args.room = this.memory.workRoom;
        } else if (this.memory.workRooms) {
            args.rooms = this.memory.workRooms;
        }
    }

    let workId = getWorkTask(workTasks, this, args);
    if (!workId) return false;

    this.memory.workId = workId;
    return true;
}

Creep.prototype.doWork = function() {
    doWorkTask(this);
}

Object.defineProperty(Creep.prototype, 'process', {
    get: function() {
        if (!this.memory.pid) return false;
        return Game.kernel.getProcessByPid(this.memory.pid);
    },
    set: function(value) {
        this.memory.pid = value.pid;
    },
});

Creep.prototype.doTransfer = function(target, resourceType) {
    if (!target) {
        this.memory.goingTo = undefined;
        return ERR_INVALID_ARGS;
    }

    if (resourceType && RESOURCES_ALL.indexOf(resourceType) < 0) {
        this.memory.goingTo = undefined;
        return ERR_INVALID_ARGS;
    }

    if (!this.pos.inRangeTo(target, 1)) {
        let args = {
            range: 1,
            reusePath: 20,
            maxRooms: 1,
            ignoreCreeps: true,
        };

        if (this.memory.role == C.ROLE_RESUPPLY) {
            args.ignoreCreeps = false;
            args.reusePath = 5;
        }

        if (this.memory.role == C.ROLE_STOCKER) {
            args.ignoreRoads = true;
        }

        this.goto(target, args);
        return;
    }

    if (resourceType) {
        this.transfer(target, resourceType);
    } else {
        for (let resource in this.carry) {
            this.transfer(target, resource);
        }
    }

    this.memory.goingTo = undefined;
}

Creep.prototype.doWithdraw = function(target, resourceType) {
    if (!target) {
        this.memory.goingTo = false;
        return ERR_INVALID_ARGS;
    }
    if (resourceType && RESOURCES_ALL.indexOf(resourceType) < 0) {
        this.memory.goingTo = false;
        return ERR_INVALID_ARGS;
    }

    if (!this.pos.inRangeTo(target, 1)) {
        let args = {
            range: 1,
            reusePath: 20,
            maxRooms: 1,
            ignoreCreeps: true,
        };

        if (this.memory.role == C.ROLE_RESUPPLY) {
            args.ignoreCreeps = false;
        }

        if (this.memory.role == C.ROLE_STOCKER) {
            args.ignoreRoads = true;
        }

        this.goto(target, args);
        return false;
    }

    if (resourceType) {
        this.withdraw(target, resourceType);
    } else {
        for (let resource in target.store) {
            this.withdraw(target, resource);
        }
    }

    this.memory.goingTo = false;
}

Creep.prototype.doEmpty = function(types, resourceType) {
    if (!Array.isArray(types)) { return ERR_INVALID_ARGS; }
    if (resourceType && RESOURCES_ALL.indexOf(resourceType) < 0) {
        return ERR_INVALID_ARGS;
    }

    if (!this.memory.goingTo) {
        let resourceSum = false;
        if (resourceType) {
            resourceSum = this.carry[resourceType];
        } else {
            resourceSum = _.sum(this.carry);
        }

        if (!resourceSum) { return false; }

        if (!this.getEmptyTarget(types, resourceSum)) {
            this.sleep();
            this.say('💤');
            return true;
        }
    }

    this.doTransfer(Game.getObjectById(this.memory.goingTo), resourceType)
};

Creep.prototype.getEmptyTarget = function(types, resourceSum) {
    if (!Array.isArray(types)) { return ERR_INVALID_ARGS; }
    if (isNaN(resourceSum)) { return ERR_INVALID_ARGS; }

    let target = getStorageStore(this, resourceSum, types);
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

Creep.prototype.doFill = function(types, resourceType) {
    if (!Array.isArray(types)) { return ERR_INVALID_ARGS; }

    this.memory.fillTick = this.memory.fillTick || 0;
    if ((this.memory.fillTick + C.CREEP_FILL_TICKS) < Game.time) {
        this.memory.goingTo = false;
    }

    if (!this.memory.goingTo) {
        if (this.getFillTarget(types, resourceType)) {
            this.memory.fillTick = Game.time;
        } else {
            this.sleep();

            this.say('💤');

            return true;
        }
    }

    this.doWithdraw(Game.getObjectById(this.memory.goingTo), resourceType);
    return true;
};

Creep.prototype.getFillTarget = function(types) {
    if (!Array.isArray(types)) { return ERR_INVALID_ARGS; }

    let target = getStorageWithdraw(this, (this.carryCapacity - _.sum(this.carry)), types);

    if (target) {
        this.setGoingTo(target);
        return true;
    }

    if (this.room.name != this.memory.spawnRoom &&
        (this.memory.role != C.ROLE_HAULER && this.memory.style != 'longhauler')) {
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
    return goto.travel(this, target, args);
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
};

Creep.prototype.getDestructibleStructures = function(path) {
    if (!path || !path.length) { return ERR_INVALID_ARGS; }

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
    if (this.pos.isOnRoad() || this.pos.isOnContainer()) {
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
