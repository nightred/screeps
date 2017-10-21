/*
 * task Source
 *
 * harvestes energy from the source
 *
 */

const STATE_INIT        = 0;
const STATE_GOTOWORK    = 1;
const STATE_HARVEST     = 2;
const STATE_DEPOSIT     = 3;

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
    this.getWorkPos();
    this.doStorage();

    for (var i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }

    this.doHaulers();
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doCreepActions = function(creep) {
    if (creep.state == STATE_DEPOSIT) {
        this.doStateDeposit(creep);
    } else if (creep.state == STATE_HARVEST) {
        this.doStateHarvest(creep);
    } else if (creep.state == STATE_GOTOWORK) {
        this.doStateGotoWork(creep);
    } else if (creep.state == 'init') {
        this.doStateInit(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doStateDeposit = function(creep) {
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
taskSource.prototype.doStateHarvest = function(creep) {
    let source = Game.getObjectById(this.memory.sourceId);
    creep.harvest(source);

    if (creep.carryCapacity === 0) return;
    if ((creep.carryCapacity * 0.5) < _.sum(creep.carry)) {
        if (this.memory._construction) {
            let construction = Game.getObjectById(this.memory._construction);
            if (!construction) {
                this.memory._construction = undefined;
            } else {
                creep.build(construction);
            }
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
taskSource.prototype.doStateGotoWork = function(creep) {
    if (creep.getOffExit()) return;
    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    let workPos = this.workPos;
    if (!workPos) {
        logger.debug('failed to get proper work pos, PID: ' + this.pid);
        return;
    }
    if (creep.pos.isEqualTo(workPos, 0)) {
        creep.state = STATE_HARVEST;
        return;
    }

    creep.goto(workPos, {
        range: 0,
        maxRooms:1,
        reUsePath: 80,
        maxOps: 4000,
        ignoreCreeps: true,
    });
};

/**
* @param {Creep} creep The creep object
**/
taskSource.prototype.doStateInit = function(creep) {
    if (!creep.spawning) creep.state = STATE_GOTOWORK;
};

taskSource.prototype.getWorkPos = function() {
    if (this.memory._setWorkPos) return;
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
    this.memory._setWorkPos = 1;
};

taskSource.prototype.doStorage = function() {
    if (this.container || this.link) return;
    let workPos = this.workPos;
    if (!workPos) return;
    if (!this.memory._construction) {
        let construction = workPos.getConstruction();
        if (!construction) {
            let linkPos = this.linkPos;
            if (linkPos) construction = linkPos.getConstruction();
        }
        if (construction) {
            this.memory._construction = construction.id;
            return;
        }
    }
    if (this.memory._construction && Game.getObjectById(this.memory._construction))
        return;
    if (this.memory._construction) {

    }
    let room = Game.rooms[this.memory.workRoom];
    if (!room) return;
    if (this.memory.spawnRoom == this.memory.workRoom) {
        let linkPos = this.linkPos;
        if (!linkPos) {
            linkPos = workPos.getMostOpenInRange(1);
            this.linkPos = linkPos;
        }
        if (room.isBuildAble(STRUCTURE_LINK)) {
            room.createConstructionSite(workPos, STRUCTURE_LINK);
            return;
        }
    }
    room.createConstructionSite(workPos, STRUCTURE_CONTAINER);
};

taskSource.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let source = Game.getObjectById(this.memory.sourceId);
    if (!source) return;

    let style = 'default';
    if (this.container) {
        style = 'drop';
    } else if (this.memory.spawnRoom != this.memory.workRoom) {
        style = 'ranged';
    }

    let spawnDetail = {
        role: C.ROLE_MINER,
        priority: 50,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            style: style,
        },
        limit: 1,
    };

    this.setSpawnDetails(spawnDetail);
};

taskSource.prototype.doHaulers = function() {
    if (this.memory._sleepHaulers && this.memory._sleepHaulers > Game.time) return;
    this.memory._sleepHaulers = Game.time + (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20));

    let source = Game.getObjectById(this.memory.sourceId);
    if (!source) return;
    let containerInID = source.getContainerIn();
    if (!containerInID) return;

    let process = this.taskHaulers;
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_HAUL, {
            spawnRoom: this.memory.spawnRoom,
            workRoom: this.memory.workRoom,
            containerId: containerInID,
        });
        this.taskHaulers = process;
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

var getPos = function(pos) {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
};

registerProcess('tasks/source', taskSource);
