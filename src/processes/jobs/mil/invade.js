/*
 * job Invade
 *
 * sends an invasion
 *
 */

const STATE_INIT = 0;
const STATE_SPAWN = 1;
const STATE_STAGING = 2;
const STATE_ATTACK = 3;

var logger = new Logger('[Job Mil Invade]');

var jobMilInvade = function() {
    // init
};

_.merge(jobMilInvade.prototype, require('lib.spawn.job'));

jobMilInvade.prototype.run = function() {
    this.doCreepCleanup();

    if (this.state === STATE_ATTACK) {
        this.doAttackStage();
    } else if (this.state === STATE_STAGING) {
        // todo
    } else if (this.state === STATE_SPAWN) {
        this.doSpawnStage();
    } else if (this.state === STATE_INIT) {
        this.doInit();
    }
};

jobMilInvade.prototype.doAttackStage = function() {
    if (_.isEmpty(this.memory.creeps)) {
        logger.alert('completed job, all creeps have been removed or killed, removing process');
        Game.kernel.killProcess(this.pid);
        return;
    }

    let flag = this.flag;
    if (flag) this.memory.workRoom = flag.room.name;

    let healer;
    let brawler;
    for (var i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        if (creep.memory.role == C.ROLE_COMBAT_MEDIC) {
            healer = creep;
        } else if (creep.memory.role == C.ROLE_COMBAT_BRAWLER) {
            brawler = creep;
        }
    }
    this.doAttacker(brawler);
    this.doHealer(healer, brawler);
};

jobMilInvade.prototype.doAttacker = function(creep) {
    if (!creep) return;
    if (creep.getOffExit()) return;
    if (creep.room.name !== this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    var nearCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
    if (nearCreeps) {
        creep.attack(nearCreeps[0]);
    }
    let target = Game.getObjectById(creep.memory.targetId);
    if (!target) {
        target = this.getTarget(creep);
        if (!target) return this.doRally(creep);
        creep.memory.targetId = target.id;
    }


    if (!creep.pos.inRangeTo(target, 1)) {
        let args = {
            reusePath: 10,
            ignoreDestructibleStructures: true,
            maxRooms: 1,
            visualizePathStyle: {
                fill: 'transparent',
                stroke: '#ff1919',
                lineStyle: 'dashed',
                strokeWidth: .15,
                opacity: .2,
            },
        };
        if (!target.StructureType) args.reusePath = 1;
        creep.moveTo(target, args);
    } else {
        creep.attack(target);
    }
};

jobMilInvade.prototype.doHealer = function(creep, target) {
    if (!creep || !target) return;
    if (creep.getOffExit()) return;
    if (creep.room.name !== this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }
    if (!creep.pos.inRangeTo(target, 1)) {
        creep.moveTo(target, {
            range: 1,
            reUsePath: 4,
            ignoreCreeps: true,
        });
    }
    if (target.hits < target.hitsMax) {
        if (creep.pos.inRangeTo(target, 1)) {
            creep.heal(target);
        } else if (creep.pos.inRangeTo(target, 3)) {
            creep.rangedHeal(target);
        }
    }
};

jobMilInvade.prototype.getTarget = function(creep) {
    let targets = creep.room.getHostileStructures()
    targets = _.filter(targets, target =>
        target.structureType == STRUCTURE_TOWER);
    targets = _.filter(targets, structure =>
        structure.owner &&
        !isAlly(structure.owner.username));

    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    targets = creep.room.getHostiles();
    targets = _.filter(targets, creep =>
        creep.owner &&
        !isAlly(creep.owner.username));

    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    targets = creep.room.getHostileSpawns()
    targets = _.filter(targets, structure =>
        structure.owner &&
        !isAlly(structure.owner.username));

    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    targets = creep.room.getHostileStructures()
    targets = _.filter(targets, structure =>
        structure.owner &&
        !isAlly(structure.owner.username));

    if (targets.length > 0) {
        targets = _.filter(targets, target =>
            target.structureType != STRUCTURE_CONTROLLER);
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    return false;
};

jobMilInvade.prototype.doRally = function(creep) {
    creep.moveToIdlePosition();
};

jobMilInvade.prototype.doSpawnStage = function() {
    this.doCreepSpawn();
    let allStaged = true;
    let spawnHoldPos = this.spawnHoldPos;
    for (var i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        if (creep.spawning) {
            allStaged = false;
            continue;
        }
        if (!creep.pos.inRangeTo(spawnHoldPos, 2)) {
            creep.goto(spawnHoldPos, {range: 1, ignoreCreeps: false});
            allStaged = false;
        }
    }
    if (this.memory._spawnComplete && allStaged) this.state = STATE_ATTACK;
};

jobMilInvade.prototype.doInit = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        logger.debug('removing process, missing needed values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom
        );
        Game.kernel.killProcess(this.pid);
        return;
    };
    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom) return;
    let spawnHoldPos = spawnRoom.getOpenAreaAtRange(3);
    if (!spawnHoldPos) return;
    this.spawnHoldPos = spawnHoldPos;
    this.memory.spawn = {
        [C.ROLE_COMBAT_BRAWLER]: 1,
        [C.ROLE_COMBAT_MEDIC]: 1
    };
    this.state = STATE_SPAWN;
};

Object.defineProperty(jobMilInvade.prototype, 'flag', {
    get: function() {
        if (!this.memory.flagTag) return false;
        return Game.flags[this.memory.flagTag];
    },
});

Object.defineProperty(jobMilInvade.prototype, 'state', {
    get: function() {
        this.memory._state = this.memory._state || STATE_INIT;
        return this.memory._state;
    },
    set: function(value) {
        this.memory._state = value;
    },
});

Object.defineProperty(jobMilInvade.prototype, 'spawnHoldPos', {
    get: function() {
        if (!this.memory._spawnHoldPos) return false;
        return getPos(this.memory._spawnHoldPos);
    },
    set: function(value) {
        if (!(value instanceof RoomPosition)) {
            if (!value.pos) return;
            value = value.pos;
        }
        this.memory._spawnHoldPos = value;
    },
});

var getPos = function(pos) {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
};

registerProcess(C.JOB_MIL_INVADE, jobMilInvade);
