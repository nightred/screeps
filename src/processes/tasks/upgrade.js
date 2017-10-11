/*
 * task Upgrade
 *
 * upgrade the room controller
 *
 */

var taskUpgrade = function() {
    // init
};

_.merge(taskUpgrade.prototype, require('lib.spawn.creep'));

taskUpgrade.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doSpawnDetails();
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskUpgrade.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.manageState()) {
        if (creep.memory.working) {
            creep.say('📡');
        } else {
            creep.say('🔋');
        }
    }

    if (creep.memory.working) {
        this.doWork(creep);
    } else {
        this.withdrawEnergy(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskUpgrade.prototype.doWork = function(creep) {
    if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
        let args = {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
        };
        creep.goto(creep.room.controller, args);
        return;
    }

    creep.upgradeController(creep.room.controller)
};

/**
* @param {Creep} creep The creep object
**/
taskUpgrade.prototype.withdrawEnergy = function(creep) {
    let targets = [
        'linkOut',
        'containerOut',
        'container',
    ];

    if (!creep.room.storage ||
        (creep.room.controller && creep.room.controller.my &&
        creep.room.controller.level < 4)
    ) {
        targets.push('extention');
        targets.push('spawn');
    }

    creep.doFill(targets, RESOURCE_ENERGY);
};

taskUpgrade.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 9999;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 3) {
        minSize = 300;
    } else if (rlevel == 4 || rlevel == 5 || rlevel == 6) {
        minSize = 400;
    } else if (rlevel == 7 || rlevel == 8) {
        minSize = 600;
    }

    let limit = 2;
    let rcl8 = 0;
    let storageEnergy = 0;
    if (spawnRoom.storage) {
        storageEnergy = spawnRoom.storage.store[RESOURCE_ENERGY];
        if (rlevel < 8 && rlevel >= 4) {
            if (storageEnergy < C.DIRECTOR_MIN_ENG_UPGRADERS) {
                limit = 0;
            } else if (storageEnergy < 50000 ) {
                limit = 1;
            } else if (storageEnergy < 80000 ) {
                limit = 2;
            } else if (storageEnergy < 150000 ) {
                limit = 3;
            } else if (storageEnergy < 200000 ) {
                limit = 4;
            } else if (storageEnergy >= 200000 ) {
                limit = 5;
            }
        }
    }

    if (spawnRoom.controller.level == 8 ) {
        limit = 1;
        rcl8 = 1;
    }

    let spawnDetail = {
        role: C.ROLE_UPGRADER,
        priority: 60,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {
            rcl8: rcl8,
        },
        maxSize: maxSize,
        minSize: minSize,
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

registerProcess('tasks/upgrade', taskUpgrade);
