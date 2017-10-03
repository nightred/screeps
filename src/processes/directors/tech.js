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

directorTech.prototype.doTechsTask = function() {
    if (!this.taskTechs) {
        process = Game.kernel.startProcess(this, C.TASK_TECH, {
            spawnRoom: this.memory.spawnRoom,
        });
        this.taskTechs = process;
    }
};

registerProcess(C.DIRECTOR_TECH, directorTech);
