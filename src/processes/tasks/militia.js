/*
 * task Militia
 *
 * task Militia defends rooms
 *
 */

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

/**
* @param {Creep} creep The creep object
**/
taskMilitia.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (!creep.hasWork()) {
        if (!creep.getWork([C.WORK_DEFENSE], {
            spawnRoom: creep.memory.spawnRoom
        })) {
            creep.sleep();
            creep.say('💤');

            return;
        }
    }

    creep.doWork();
};

taskMilitia.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let limit = 0;
    let clevel = spawnRoom.controller.level;
    if (clevel == 2 || clevel == 3) {
        limit = 1;
    } else if (clevel == 4 || clevel == 5 || clevel == 6) {
        limit = 1;
    } else if (clevel == 7) {
       limit = 1;
    } else if (clevel == 8) {
        limit = 2;
    }

    let spawnDetail = {
        role: C.ROLE_COMBAT_MILITIA,
        priority: 38,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {},
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

registerProcess(C.TASK_MILITIA, taskMilitia);
