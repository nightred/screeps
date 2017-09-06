/*
 * Director Tech
 *
 * manages the spawning of techs
 *
 */

var logger = new Logger('[Tech Director]');
logger.level = C.LOGLEVEL.DEBUG;

var directorTech = function() {
    // init
};

Object.defineProperty(directorTech.prototype, 'squad', {
    get: function() {
        if (!this.memory.squadPid) return false;
        return Game.kernel.getProcessByPid(this.memory.squadPid);
    },
    set: function(value) {
        this.memory.squadPid = value.pid;
    },
});

directorTech.prototype.run = function() {
    if (isSleep(this)) return true;

    this.createWork();

    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom.isInCoverage(this.memory.workRoom)) {
        spawnRoom.addCoverage(this.memory.workRoom);
    }

    if (this.memory.spawnRoom == this.memory.workRoom) {
        this.doSquadSpawnLimits();
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

directorTech.prototype.createWork = function() {
    let workRoom = Game.rooms[this.memory.workRoom];

    let findWorkTasks = [
        C.WORK_TOWER_REFILL,
        C.WORK_REPAIR,
        C.WORK_CONSTRUCTION,
    ];

    for (let i = 0; i < findWorkTasks.length; i++) {
        doWorkFind(findWorkTasks[i], workRoom);
    }
};

directorTech.prototype.doSquadSpawnLimits = function() {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 1 || rlevel == 2)  {
        maxSize = 300;
    } else if (rlevel == 3)  {
        maxSize = 400;
    } else if (rlevel == 4) {
        minSize = 300;
        maxSize = 400;
    } else if (rlevel == 5 || rlevel == 6) {
        minSize = 400;
        maxSize = 500;
    } else if (rlevel == 7 || rlevel == 8) {
        minSize = 400;
        maxSize = 9999;
    }

    if (spawnRoom.storage && spawnRoom.controller.level < 4) minSize = 200;

    let creepLimit = 1;

    if (!this.memory.creepLimit) {
        let roomCount = spawnRoom.countCoverage();

        if (!isNaN(roomCount)) {
            creepLimit = roomCount;

            if (spawnRoom && spawnRoom.controller && spawnRoom.controller.my &&
                spawnRoom.controller.level >= 4) {
                creepLimit++;
            }
        }
    } else {
        creepLimit = this.memory.creepLimit;
    }

    let roomCoverage = spawnRoom.getCoverage();

    let record = {
        name: 'techs',
        task: C.TASK_TECH,
        role: C.ROLE_TECH,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
        creepArgs: {
            style: 'default',
        },
    };

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        continue;
    }

    process.memory.workRooms = roomCoverage;
    process.setGroup(record);
};

directorTech.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let process = Game.kernel.startProcess(this, imageName, {
        name: (this.memory.workRoom + '_techs'),
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        continue;
    }

    this.squad = process;
};

registerProcess(C.DIRECTOR_TECH, directorTech);
