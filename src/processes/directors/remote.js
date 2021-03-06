/*
 * Director Remote
 *
 * runs processes to manage Remote rooms
 *
 */

var logger = new Logger('[Remote Room Director]');

var directorRemote = function() {
    // init
}

_.merge(directorRemote.prototype, require('lib.containers'));
_.merge(directorRemote.prototype, require('lib.sources'));
_.merge(directorRemote.prototype, require('lib.defense'));

Object.defineProperty(directorRemote.prototype, 'directorMining', {
    get: function() {
        if (!this.memory.directorMiningPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorMiningPid);
    },
    set: function(value) {
        this.memory.directorMiningPid = value.pid;
    },
});

Object.defineProperty(directorRemote.prototype, 'taskScout', {
    get: function() {
        if (!this.memory.scoutPid) return false;
        return Game.kernel.getProcessByPid(this.memory.scoutPid);
    },
    set: function(value) {
        this.memory.scoutPid = value.pid;
    },
});

Object.defineProperty(directorRemote.prototype, 'taskReserver', {
    get: function() {
        if (!this.memory.reserverPid) return false;
        return Game.kernel.getProcessByPid(this.memory.reserverPid);
    },
    set: function(value) {
        this.memory.reserverPid = value.pid;
    },
});

/**
* @param {task} task the director task memory
**/
directorRemote.prototype.run = function() {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    if (!spawnRoom.isInCoverage(this.memory.workRoom)) {
        spawnRoom.addCoverage(this.memory.workRoom);
    }

    this.doScoutRoom();

    this.doReserver();

    this.createWorkTasks();
    this.doDefense();
    this.doDirectors();

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20)));
};

directorRemote.prototype.doScoutRoom = function() {
    if (!Game.rooms[this.memory.workRoom]) {
        if (!this.taskScout) {
            let proc = Game.kernel.startProcess(this, C.JOB_SCOUT, {
                workRoom: this.memory.workRoom,
                spawnRoom: this.memory.spawnRoom,
            });
            if (!proc) {
                logger.error(`failed to start scout process: ${C.TASK_SCOUT}`);
                return;
            }
            this.taskScout = proc;
        }
    }
};

directorRemote.prototype.createWorkTasks = function() {
    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom) return;

    let findWorkTasks = [
        C.WORK_REPAIR,
        C.WORK_CONSTRUCTION,
    ];

    for (var i = 0; i < findWorkTasks.length; i++) {
        doWorkFind(findWorkTasks[i], workRoom);
    }
};

directorRemote.prototype.doReserver = function() {
    if (!this.taskReserver) {
        let process = Game.kernel.startProcess(this, C.TASK_RESERVE, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.taskReserver = process;
    }
};

directorRemote.prototype.doDirectors = function() {
    if (!this.directorMining) {
        let process = Game.kernel.startProcess(this, C.DIRECTOR_MINING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorMining = process;
    }
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorRemote.prototype.flag = function(roomName, args) {
    this.memory.workRoom = roomName;
    this.memory.spawnRoom = args[2];
};

registerProcess(C.DIRECTOR_REMOTE, directorRemote);
