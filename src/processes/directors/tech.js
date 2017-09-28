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

Object.defineProperty(directorTech.prototype, 'taskTechs', {
    get: function() {
        if (!this.memory.techsPid) return false;
        return Game.kernel.getProcessByPid(this.memory.techsPid);
    },
    set: function(value) {
        this.memory.techsPid = value.pid;
    },
});

directorTech.prototype.run = function() {
    this.createWorkTasks();

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom.isInCoverage(this.memory.workRoom))
        spawnRoom.addCoverage(this.memory.workRoom);

    if (this.memory.spawnRoom == this.memory.workRoom) {
        this.doTechsTask(spawnRoom);

        // remove old squad
        if (this.memory.squadPid) {
            Game.kernel.killProcess(this.memory.squadPid);
            this.memory.squadPid = undefined;
        }
    }

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20)));
};

directorTech.prototype.createWorkTasks = function() {
    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom) return;

    let findWorkTasks = [
        C.WORK_TOWER_REFILL,
        C.WORK_REPAIR,
        C.WORK_CONSTRUCTION,
    ];

    for (let i = 0; i < findWorkTasks.length; i++) {
        doWorkFind(findWorkTasks[i], workRoom);
    }
};

directorTech.prototype.doTechsTask = function(spawnRoom) {
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

    let limit = spawnRoom.countCoverage();
    if (spawnRoom.controller.level >= 6) limit++
    if (spawnRoom.storage &&
        spawnRoom.storage.store[RESOURCE_ENERGY] < C.DIRECTOR_MIN_ENG_TECH
    ) limit = 1;
    //if (limit > 4) limit = 4;

    let roomCoverage = spawnRoom.getCoverage();

    let process = this.taskTechs;
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_TECH, {});
        if (!process) {
            logger.error('failed to create process ' + C.TASK_TECH);
            return;
        }
        this.taskTechs = process;
    }

    process.setSpawnDetails({
        spawnRoom: this.memory.spawnRoom,
        role: C.ROLE_TECH,
        priority: 58,
        maxSize: maxSize,
        minSize: minSize,
        limit: limit,
        creepArgs: {
            workRooms: roomCoverage,
        },
    });

};

registerProcess(C.DIRECTOR_TECH, directorTech);
