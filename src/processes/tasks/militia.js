/*
 * task Militia
 *
 * creates group of creeps to attak invaders to a room
 * and the coverage area for the room
 *
 */

const STATE_INIT    = 0;
const STATE_IDLE    = 1;
const STATE_DEFENSE = 2;

var logger = new Logger('[Task Militia]');

var taskMilitia = function() {
    // init
};

_.merge(taskMilitia.prototype, require('lib.spawn.creep'));

taskMilitia.prototype.run = function() {
    if (!this.memory.spawnRoom) {
        logger.debug('removing process missing values\n' +
            'spawnRoom: ' + this.memory.spawnRoom
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

taskMilitia.prototype.getAssignedRoom = function() {

};

/**
* @param {Creep} creep The creep object
**/
taskMilitia.prototype.doCreepActions = function(creep) {
    if (creep.getOffExit()) return;

    if (creep.state === STATE_IDLE) {
        this.doCreepIdle(creep);
    } else if (creep.state === STATE_DEFENSE) {
        this.doCreepDefense(creep);
    } else if (creep.state === STATE_INIT || creep.state === 'init') {
        this.doCreepInit(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskMilitia.prototype.doCreepInit = function(creep) {
    if (creep.spawning) return;
    creep.state = STATE_IDLE;
    creep.say('💤');
};

/**
* @param {Creep} creep The creep object
**/
taskMilitia.prototype.doCreepIdle = function(creep) {
    if (creep.getWork([C.WORK_DEFENSE], {
            spawnRoom: creep.memory.spawnRoom
        })
    ) {
        creep.state = STATE_DEFENSE;
        creep.say('💤');
        return;
    }
    creep.moveToIdlePosition();
};

/**
* @param {Creep} creep The creep object
**/
taskMilitia.prototype.doCreepDefense = function(creep) {
    if (!creep.hasWork()) {
        creep.state = STATE_IDLE;
        creep.say('💤');
    } else {
        creep.doWork();
    }
};

taskMilitia.prototype.doSpawnDetails = function() {
    if (this.memory.spawnDetails) return;
    this.setSpawnDetails({
        role: C.ROLE_COMBAT_MILITIA,
        priority: 38,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {},
        limit: 1,
    });
};

registerProcess(C.TASK_MILITIA, taskMilitia);
