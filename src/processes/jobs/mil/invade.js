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

_.merge(jobMilInvade.prototype, require('lib.spawn.group'));

jobMilInvade.prototype.run = function() {
    this.doCreepCleanup();

    if (this.state === STATE_ATTACK) {
        if (_.isEmpty(this.memory.creeps)) {
            logger.alert('completed job, all creeps have been removed or killed, removing process');
            Game.kernel.killProcess(this.pid);
            return;
        }
        this.doCreepActions();
    } else if (this.state === STATE_STAGING) {
        if (_.isEmpty(this.memory.creeps)) {
            logger.alert('completed job, all creeps have been removed or killed, removing process');
            Game.kernel.killProcess(this.pid);
            return;
        }
        this.doCreepActions();
    } else if (this.state === STATE_SPAWN) {
        if (this.memory._spawnComplete) {
            this.state = STATE_STAGING;
            return;
        }
        this.doCreepSpawn();
    } else if (this.state === STATE_INIT) {
        if (!this.memory.spawnRoom || !this.memory.workRoom) {
            logger.debug('removing process, missing needed values\n' +
                'spawnRoom: ' + this.memory.spawnRoom +
                ', workRoom: ' + this.memory.workRoom
            );
            Game.kernel.killProcess(this.pid);
            return;
        };
        this.state = STATE_SPAWN;
    }
};

jobMilInvade.prototype.doCreepStage = function() {
    if (!this.stagePos) {
        let stagePos = 0;

        this.stagePos = stagePos;
    }

    for (const role in this.memory.creeps) {
        for (var i = 0; i < this.memory.creeps[role].length; i++) {
            let creep = Game.creeps[this.memory.creeps[role][i]];
            if (!creep) continue;


        }
    }
};

jobMilInvade.prototype.doCreepActions = function() {
    for (const role in this.memory.creeps) {
        for (var i = 0; i < this.memory.creeps[role].length; i++) {
            let creep = Game.creeps[this.memory.creeps[role][i]];
            if (!creep) continue;
            if (creep.spawning) return;
            if (creep.getOffExit()) return;
            switch(creep.memory.role) {
            case C.ROLE_COMBAT_MEDIC:
                this.doHeal(creep);
                break;
            default:
                this.doAttack(creep);
            }
        }
    }
};

jobMilInvade.prototype.doAttack = function(creep) {
    creep.memory.targetId = creep.memory.targetId || false;

    if (!creep.memory.targetId) {
        creep.memory.targetId = this.getTarget(creep);
    }

    let target = Game.getObjectById(creep.memory.targetId);
    if (!target) {
        creep.memory.targetId = false;
        return this.doRally(creep);
    }

    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        let args = {
            reusePath: 10,
            ignoreCreeps: true,
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

        if (!target.StructureType) {
            args.reusePath = 1;
        }

        creep.moveTo(target, args);
    }

    return true;
};

jobMilInvade.prototype.doHeal = function(creep) {
    let targets = _.sortBy(_.filter(creep.room.find(FIND_MY_CREEPS), creep =>
        creep.hits < creep.hitsMax
        ), creep => creep.hits);

    if (targets.length <= 0) {
        return this.doRally(creep);
    }

    targets = _.sortBy(targets, target => creep.pos.getRangeTo(target.pos));
    if (creep.heal(targets[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { range: 1, reUsePath: 4, ignoreCreeps: true, });
        creep.rangedHeal(targets[0]);
    }

    return true;
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

Object.defineProperty(jobMilInvade.prototype, 'flag', {
    get: function() {
        if (!this.memory.flagTag) return false;
        return Game.flags[this.memory.flagTag];
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

Object.defineProperty(taskSource.prototype, 'stagePos', {
    get: function() {
        if (!this.memory._stagePos) return false;
        return getPos(this.memory._stagePos);
    },
    set: function(value) {
        if (!(value instanceof RoomPosition)) {
            if (!value.pos) return;
            value = value.pos;
        }
        this.memory._stagePos = value;
    },
});

var getPos = function(pos) {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
};

registerProcess(C.JOB_MIL_INVADE, jobMilInvade);
