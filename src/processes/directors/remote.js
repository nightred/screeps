/*
 * Director Remote
 *
 * runs processes to manage Remote rooms
 *
 */

var logger = new Logger('[Remote Room Director]');
logger.level = C.LOGLEVEL.DEBUG;

var directorRemote = function() {
    // init
}

_.extend(directorRemote.prototype, require('lib.containers'));
_.extend(directorRemote.prototype, require('lib.sources'));
_.extend(directorRemote.prototype, require('lib.defense'));

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

Object.defineProperty(directorRemote.prototype, 'taskHaulers', {
    get: function() {
        if (!this.memory.haulersPid) return false;
        return Game.kernel.getProcessByPid(this.memory.haulersPid);
    },
    set: function(value) {
        this.memory.haulersPid = value.pid;
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
    this.doInterHaulers();

    this.createWorkTasks();
    this.doDefense();
    this.doDirectors();

    // remove old squad
    if (this.memory.squadPid) {
        Game.kernel.killProcess(this.memory.squadPid);
        this.memory.squadPid = undefined;
    }

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 20)));
};

directorRemote.prototype.doScoutRoom = function() {
    if (this.memory.workRoomInit) return;

    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom) {
        if (!this.taskScout) {
            let proc = Game.kernel.startProcess(this, C.TASK_SCOUT, {
                workRoom: this.memory.workRoom,
                spawnRoom: this.memory.spawnRoom,
            });

            if (!proc) {
                logger.error(`failed to start scout process: ${C.TASK_SCOUT}`);
                return;
            }

            this.taskScout = proc;
        }
        return;
    }

    if (this.memory.sleepScoutRoom && this.memory.sleepScoutRoom < Game.time) {
        logger.debug('removing scout for room: ' + this.memory.workRoom);
        let proc = this.taskScout;
        Game.kernel.killProcess(proc.pid);
        this.memory.workRoomInit = 1;
        this.memory.sleepScoutRoom = undefined;
        return;
    }

    if (!this.memory.sleepScoutRoom) {
        this.memory.sleepScoutRoom = 2000 + Game.time;
    }
};

directorRemote.prototype.createWorkTasks = function() {
    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom) return;

    let findWorkTasks = [
        C.WORK_REPAIR,
        C.WORK_CONSTRUCTION,
    ];

    for (let i = 0; i < findWorkTasks.length; i++) {
        doWorkFind(findWorkTasks[i], workRoom);
    }
};

directorRemote.prototype.doInterHaulers = function() {
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

    let limit = 2;

    let process = this.taskHaulers;
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_HAUL, {});
        if (!process) {
            logger.error('failed to create process ' + C.TASK_HAUL);
            return;
        }
        this.taskHaulers = process;
    }

    process.spawnDetails = {
        spawnRoom: this.memory.spawnRoom,
        role: C.ROLE_HAULER,
        priority: 52,
        maxSize: maxSize,
        minSize: minSize,
        limit: limit,
        creepArgs: {
            style: 'longhauler',
            workRooms: this.memory.workRoom,
        },
    };

};

directorRemote.prototype.doReserver = function() {
    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom || !workRoom.controller) return;

    let limit = 1;
    if (!workRoom.controller.reservation ||
        (workRoom.controller.reservation &&
        workRoom.controller.reservation.ticksToEnd < C.CONTROLLER_RESERVE_MIN)
    ) {
        limit = 0;
    }

    let process = this.taskReserver;
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_RESERVE, {});
        if (!process) {
            logger.error('failed to create process ' + C.TASK_RESERVE);
            return;
        }
        this.taskReserver = process;
    }

    process.spawnDetails = {
        spawnRoom: this.memory.spawnRoom,
        role: C.ROLE_CONTROLLER,
        priority: 70,
        maxSize: 9999,
        minSize: 0,
        limit: limit,
        creepArgs: {
            style: 'reserve',
            workRooms: this.memory.workRoom,
        },
    };
};

directorRemote.prototype.doDirectors = function() {
    if (!this.directorMining) {
        let proc = Game.kernel.startProcess(this, C.DIRECTOR_MINING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorMining = proc;
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
