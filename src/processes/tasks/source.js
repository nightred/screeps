/*
 * task Source
 *
 * harvestes energy from the source
 *
 */

const STATE_INIT            = 0;
// creep state
const STATE_GOTOWORK        = 1;
const STATE_HARVEST         = 2;
const STATE_DEPOSIT         = 3;
// process state
const STATE_CHECKSTORAGE    = 1;
const STATE_BUILDCONTAINER  = 2;
const STATE_CONSTCONTAINER  = 3;
const STATE_BUILDLINK       = 4;
const STATE_CONSTLINK       = 5;

var taskSource = function() {
    // init
};

_.merge(taskSource.prototype, require('lib.spawn.creep'));

taskSource.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom || !this.memory.sourceId) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doSpawnDetails();
    this.doCreepSpawn();

    if (this.state == STATE_CHECKSTORAGE) {
        this.checkStorage();
    } else if (this.state == STATE_BUILDCONTAINER) {
        this.doBuildContainer();
    } else if (this.state == STATE_BUILDLINK) {
        this.doBuildLink();
    } else if (this.state == STATE_CONSTCONTAINER) {
        this.doConstructContainer();
    } else if (this.state == STATE_CONSTLINK) {
        this.doConstructLink();
    } else if (this.state == STATE_INIT) {
        this.getPositions();
    }

    for (var i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        if (creep.state == STATE_DEPOSIT) {
            this.doCreepDeposit(creep);
        } else if (creep.state == STATE_HARVEST) {
            this.doCreepHarvest(creep);
        } else if (creep.state == STATE_GOTOWORK) {
            this.doCreepGotoWork(creep);
        } else if (creep.state == 'init') {
            this.doCreepInit(creep);
        }
    }

    this.doHaulers();
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doCreepDeposit = function(creep) {
    creep.doEmpty([
        'linkIn',
        'containerIn',
        'spawn',
        'extention',
        'container',
        'containerOut',
        'storage',
    ], RESOURCE_ENERGY);
    if (_.sum(creep.carry) === 0) creep.state = STATE_GOTOWORK;
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doCreepHarvest = function(creep) {
    let source = Game.getObjectById(this.memory.sourceId);
    creep.harvest(source);
    if (creep.carryCapacity > 0 &&
        (creep.carryCapacity * 0.5) < _.sum(creep.carry)
    ) {
        if (this.memory._construction) {
            let construction = Game.getObjectById(this.memory._construction);
            if (construction) creep.build(construction);
        } else {
            let link = this.link;
            if (link) {
                creep.transfer(link, RESOURCE_ENERGY);
            } else {
                creep.state = STATE_DEPOSIT;
            }
        }
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doCreepGotoWork = function(creep) {
    if (creep.hasGoto()) {
        if (creep.resumeGoto()) return;
    }
    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    let workPos = this.workPos;
    if (!workPos) {
        logger.debug('failed to get proper work pos, PID: ' + this.pid);
        return;
    }
    if (creep.pos.isEqualTo(workPos)) {
        creep.state = STATE_HARVEST;
    } else {
        creep.goto(workPos, {
            range: 0,
            maxRooms:1,
            reUsePath: 80,
            maxOps: 4000,
            ignoreCreeps: true,
        });
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doCreepInit = function(creep) {
    if (!creep.spawning) creep.state = STATE_GOTOWORK;
};

taskSource.prototype.getPositions = function() {
    let source = Game.getObjectById(this.memory.sourceId);
    if (!source) return;
    let room = source.room;
    let positions = source.pos.getWalkableInRange(1);
    if (positions.length === 0) {
        logger.error('failed to find standing position for source ' + source.id +
            ' in room ' + room.toString()
        );
        return;
    }
    let centerPos = new RoomPosition(24, 24, source.room.name);
    let closest = centerPos.findClosestByPath(positions);
    this.workPos = closest;
    if (this.memory.spawnRoom == this.memory.workRoom) {
        let linkPos = workPos.getMostOpenInRange(1);
        this.linkPos = linkPos;
    }
    this.state = STATE_CHECKSTORAGE;
};

taskSource.prototype.checkStorage = function() {
    if (this.memory.spawnRoom != this.memory.workRoom) {
        if (this.container) return;
        this.state = STATE_BUILDCONTAINER;
        return;
    }
    if (this.container) {
        let room = Game.rooms[this.memory.workRoom];
        if (room.controller.level >= 6) this.state = STATE_BUILDLINK;
        return;
    }
    if (this.link) return;
    this.state = STATE_BUILDCONTAINER;
};

taskSource.prototype.doBuildContainer = function() {
    let workPos = this.workPos;
    let room = Game.rooms[this.memory.workRoom];
    if (!room) return;
    room.createConstructionSite(workPos, STRUCTURE_CONTAINER);
    this.state = STATE_CONSTCONTAINER;
};

taskSource.prototype.doBuildLink = function() {
    let linkPos = this.linkPos;
    let room = Game.rooms[this.memory.workRoom];
    if (!room) return;
    if (room.controller && room.controller.my &&
        room.controller.level >= 6 && linkPos &&
        room.isBuildAble(STRUCTURE_LINK) &&
        room.createConstructionSite(linkPos, STRUCTURE_LINK) === OK
    ) {
        let container = this.container;
        if (container) container.destroy();
        this.state = STATE_CONSTLINK;
    }
};

taskSource.prototype.doConstructContainer = function() {
    let workPos = this.workPos;
    if (!this.memory._construction) {
        let construction = workPos.getConstruction();
        if (!construction) {
            this.state = STATE_BUILDCONTAINER;
            return;
        }
        this.memory._construction = construction.id;
    }
    if (!Game.getObjectById(this.memory._construction)) {
        let container = workPos.getContainer();
        if (!container) {
            this.state = STATE_BUILDCONTAINER;
            return;
        }
        container.memory.type = 'in';
        this.container = container;
        this.state = STATE_CHECKSTORAGE;
        return;
    }
};

taskSource.prototype.doConstructLink = function() {
    let linkPos = this.linkPos;
    if (!this.memory._construction) {
        let construction = linkPos.getConstruction();
        if (!construction) {
            this.state = STATE_BUILDLINK;
            return;
        }
        this.memory._construction = construction.id;
    }
    if (!Game.getObjectById(this.memory._construction)) {
        let link = linkPos.getLink();
        if (!link) {
            this.state = STATE_BUILDLINK;
            return;
        }
        link.memory.type = 'in';
        this.link = link;
        this.state = STATE_CHECKSTORAGE;
        return;
    }
};

taskSource.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let style = 'default';
    if (this.container) {
        style = 'drop';
    } else if (this.memory.spawnRoom != this.memory.workRoom) {
        style = 'ranged';
    }

    this.setSpawnDetails({
        role: C.ROLE_MINER,
        priority: 50,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            style: style,
        },
        limit: 1,
    });
};

taskSource.prototype.doHaulers = function() {
    if (this.memory._sleepHaulers && this.memory._sleepHaulers > Game.time) return;
    this.memory._sleepHaulers = Game.time + (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20));

    let procHauler = this.taskHaulers;
    let container = this.container;
    if (!container) {
        if (procHauler) Game.kernel.killProcess(procHauler.pid);
        return;
    }
    if (!procHauler) {
        procHauler = Game.kernel.startProcess(this, C.TASK_HAUL, {
            spawnRoom: this.memory.spawnRoom,
            workRoom: this.memory.workRoom,
            containerId: container.id,
        });
        this.taskHaulers = procHauler;
    }
};

Object.defineProperty(taskSource.prototype, 'taskHaulers', {
    get: function() {
        if (!this.memory._haulersPid) return false;
        return Game.kernel.getProcessByPid(this.memory._haulersPid);
    },
    set: function(value) {
        this.memory._haulersPid = value.pid;
    },
});

Object.defineProperty(taskSource.prototype, 'workPos', {
    get: function() {
        if (!this.memory._workPos) return false;
        return getPos(this.memory._workPos);
    },
    set: function(value) {
        if (!(value instanceof RoomPosition)) {
            if (!value.pos) return;
            value = value.pos;
        }
        this.memory._workPos = value;
    },
});

Object.defineProperty(taskSource.prototype, 'linkPos', {
    get: function() {
        if (!this.memory._linkPos) return false;
        return getPos(this.memory._linkPos);
    },
    set: function(value) {
        if (!(value instanceof RoomPosition)) {
            if (!value.pos) return;
            value = value.pos;
        }
        this.memory._linkPos = value;
    },
});

Object.defineProperty(taskSource.prototype, 'link', {
    get: function() {
        if (!this.memory._linkId) return false;
        return Game.getObjectById(this.memory._linkId);
    },
    set: function(value) {
        this.memory._linkId = value.id;
    },
});

Object.defineProperty(taskSource.prototype, 'container', {
    get: function() {
        if (!this.memory._containerId) return false;
        return Game.getObjectById(this.memory._containerId);
    },
    set: function(value) {
        this.memory._containerId = value.id;
    },
});

Object.defineProperty(taskSource.prototype, 'state', {
    get: function() {
        this.memory._state = this.memory._state || STATE_INIT;
        return this.memory._state;
    },
    set: function(value) {
        this.memory._state = value;
    },
});

var getPos = function(pos) {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
};

registerProcess('tasks/source', taskSource);
