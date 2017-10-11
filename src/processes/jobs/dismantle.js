/*
 * task Dismantle
 *
 * Dismantle deconstructs buildings
 * deposits the refund in spawn room storage
 *
 */

var logger = new Logger('[Job Dismantle]');

var taskDismantle = function() {
    // init
};

_.merge(taskDismantle.prototype, require('lib.spawn.group'));

taskDismantle.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom ||
        !this.memory.spawn || this.memory.flagTag
    ) {
        logger.debug('removing process, missing needed values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom +
            ', spawn: ' + this.memory.spawn +
            ', flagTag: ' + this.memory.flagTag
        );
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doCreepSpawn();
    this.doCreepCleanup();

    if (this.memory._spawnComplete && _.isEmpty(this.memory.creeps)) {
        logger.alert('completed job, all creeps have been removed, removing process');
        Game.kernel.killProcess(this.pid);
        return;
    }

    for (let role in this.memory.creeps) {
        for (let i = 0; i < this.memory.creeps[role].length; i++) {
            let creep = Game.creeps[this.memory.creeps[role][i]];
            if (!creep) continue;
            this.doCreepActions(creep);
        }
    }
};

/**
* @param {Creep} creep The creep object
**/
taskDismantle.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;

    if (creep.manageState()) {
        if (creep.isWorking()) {
            creep.say('⚙');
        } else {
            creep.say('🔋');
        }
    }

    if (creep.isWorking()) {
        this.doWork(creep);
    } else {
        this.doStore(creep);
    }
};

/**
* @param {Creep} creep
**/
taskDismantle.prototype.doWork = function(creep) {
    if (!this.memory._targetId) this.memory._targetId = this.getFlagTargetId();
    let target = Game.getObjectById(this.memory._targetId);
    if (!target) {
        this.memory._targetId = undefined;
        return;
    }

    if (!creep.pos.inRangeTo(target, 1)) {
        creep.goto(target, {
            range: 1,
            maxRooms: 1,
        });
        return;
    }

    creep.dismantle(target);
};

taskDismantle.prototype.getFlagTargetId = function() {
    let flag = Game.flags[this.memory.flagTag];
    if (!flag) return;
    let structure = flag.pos.getStructure();
    if (!structure) return;
    return structure.id;
};

/**
* @param {Creep} creep
**/
taskDismantle.prototype.doStore = function(creep) {
    if (creep.room.name !== this.memory.spawnRoom) {
        creep.moveToRoom(this.memory.spawnRoom);
        return;
    }

    creep.doEmpty([ 'storage', 'container', ], RESOURCE_ENERGY);
};

registerProcess(C.JOB_DISMANTLE, taskDismantle);
