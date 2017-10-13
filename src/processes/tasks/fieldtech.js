/*
 * task Field Tech
 *
 * Field Tech is support for rooms without controllers or spawn ability
 * they self harvest the room and build or upgrade
 *
 */

var logger = new Logger('[Task Fieldtech]');

var taskFieldTech = function() {
    // init
};

_.merge(taskFieldTech.prototype, require('lib.spawn.creep'));

taskFieldTech.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        logger.debug('removing process, missing values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom
        );
        Game.kernel.killProcess(this.pid);
        return;
    }

    let cpuStart = Game.cpu.getUsed();

    this.doSpawnDetails();
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }

    addTerminalLog(this.memory.workRoom, {
        command: 'fieldtech',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
        output: ('pid: ' + this.pid),
    });
};

/**
* @param {Creep} creep The creep object
**/
taskFieldTech.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    
    if (creep.isSleep()) {
        this.doUpgrade(creep);
        return;
    }

    if (creep.room.name !== this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    if (creep.manageState()) {
        if (creep.isWorking()) {
            creep.say('⚙');
            creep.memory.harvestTarget = undefined;
        } else {
            creep.say('🔋');
            creep.leaveWork();
        }
    }

    if (creep.isWorking()) {
        this.doWork(creep);
    } else {
        this.doMine(creep);
    }
};

/**
* @param {Creep} creep
**/
taskFieldTech.prototype.doWork = function(creep) {
    if (!creep.hasWork()) {
        let workTasks = [
            C.WORK_CONSTRUCTION,
            C.WORK_SIGNCONTROLLER,
        ];

        if (!creep.getWork(workTasks, {
            room: this.memory.workRoom,
        })) {
            creep.sleep();
            creep.say('💤');
            return;
        }
    }

    creep.doWork();
};

/**
* @param {Creep} creep
**/
taskFieldTech.prototype.doMine = function(creep) {
    if (!creep.memory.harvestTarget) {
        let sources = creep.room.getSources();
        if (sources.length <= 0) return;
        sources = _.sortBy(sources, source => source.energy).reverse();
        creep.memory.harvestTarget = sources[0].id;
    }

    let source = Game.getObjectById(creep.memory.harvestTarget);

    if (source.energy === 0) {
        creep.memory.harvestTarget = undefined;
        return;
    }

    if (!creep.pos.inRangeTo(source, 1)) {
        creep.goto(source, {
            range: 1,
            reUsePath: 80,
            ignoreCreeps: true,
        });
        return;
    }

    creep.harvest(source);
};

/**
* @param {Creep} creep
**/
taskFieldTech.prototype.doUpgrade = function(creep) {
    if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
        creep.goto(creep.room.controller, {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
        });
        return;
    }

    creep.upgradeController(creep.room.controller);
};

taskFieldTech.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 1 || rlevel == 2 || rlevel == 3 || rlevel == 4) {
        maxSize = 400;
    } else if (rlevel == 5 || rlevel == 6) {
        minSize = 400;
        maxSize = 600;
    } else if (rlevel == 7 || rlevel == 8) {
        minSize = 500;
        maxSize = 9999;
    }

    this.setSpawnDetails({
        role: C.ROLE_FIELDTECH,
        priority: 58,
        spawnRoom: this.memory.spawnRoom,
        maxSize: maxSize,
        minSize: minSize,
        limit: 2,
        creepArgs: {},
    });
};

registerProcess(C.TASK_FIELDTECH, taskFieldTech);
