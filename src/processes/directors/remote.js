/*
 * Director Remote
 *
 * runs processes to manage Remote rooms
 *
 */

var LibContainers   = require('lib.containers');
var LibSources      = require('lib.sources');
var LibDefense      = require('lib.defense');

var logger = new Logger('[Remote Room Director]');
logger.level = C.LOGLEVEL.DEBUG;

var directorRemote = function() {
    // init
}

_.extend(directorRemote.prototype, LibContainers);
_.extend(directorRemote.prototype, LibSources);
_.extend(directorRemote.prototype, LibDefense);

Object.defineProperty(directorRemote.prototype, 'directorMining', {
    get: function() {
        if (!this.memory.directorMiningPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorMiningPid);
    },
    set: function(value) {
        this.memory.directorMiningPid = value.pid;
    },
});

Object.defineProperty(directorRemote.prototype, 'squad', {
    get: function() {
        if (!this.memory.squadPid) return false;
        return Game.kernel.getProcessByPid(this.memory.squadPid);
    },
    set: function(value) {
        this.memory.squadPid = value.pid;
    },
});

Object.defineProperty(directorRemote.prototype, 'scout', {
    get: function() {
        if (!this.memory.scoutPid) return false;
        return Game.kernel.getProcessByPid(this.memory.scoutPid);
    },
    set: function(value) {
        this.memory.scoutPid = value.pid;
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

    if (!this.squad) this.initSquad();

    this.doScoutRoom();
    this.doSquadGroupReserve();
    this.doSquadGroupInterHaulers();
    this.doTechServices();
    this.doDefense();
    this.doDirectors();

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorRemote.prototype.doScoutRoom = function() {
    if (this.memory.workRoomInit) return;

    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom) {
        this.doScouting();
        return;
    }

    if (this.memory.sleepScoutRoom && this.memory.sleepScoutRoom < Game.time) {
        logger.debug('removing scout for room: ' + this.memory.workRoom);
        let proc = this.scout;
        Game.kernel.killProcess(proc.pid);
        this.memory.workRoomInit = 1;
        this.memory.sleepScoutRoom = undefined;
        return;
    }

    if (!this.memory.sleepScoutRoom) {
        this.memory.sleepScoutRoom = 2000 + Game.time;
    }
};

directorRemote.prototype.doTechServices = function() {
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

directorRemote.prototype.doSquadGroupInterHaulers = function() {
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

    let process = this.squad;
    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    let containersIn = this.getIdsContainersIn();
    if (!containersIn || containersIn.length === 0) {
        process.setGroup({
            name: ('interhaulers'),
            task: C.TASK_HAUL,
            role: C.ROLE_HAULER,
            priority: 66,
            maxSize: maxSize,
            minSize: minSize,
            limit: 1,
            creepArgs: {
                style: 'longhauler',
            },
        });
        return;
    }

    process.removeGroup('interhaulers');

    for (let i = 0; i < containersIn.length; i++) {
        process.setGroup({
            name: ('hauler_' + containersIn[i]),
            task: C.TASK_HAUL,
            role: C.ROLE_HAULER,
            priority: 66,
            maxSize: maxSize,
            minSize: minSize,
            limit: 1,
            creepArgs: {
                style: 'longhauler',
                containerId: containersIn[i],
            },
        });
    }
};

directorRemote.prototype.doSquadGroupReserve = function() {
    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom || !workRoom.controller) return;

    let creepLimit = 0;
    if (!workRoom.controller.reservation ||
        (workRoom.controller.reservation &&
        workRoom.controller.reservation.ticksToEnd < C.CONTROLLER_RESERVE_MIN)
    ) {
        creepLimit = 1;
    }

    let record = {
        name: 'reservers',
        task: C.TASK_RESERVE,
        role: C.ROLE_CONTROLLER,
        priority: 70,
        maxSize: 9999,
        minSize: 0,
        limit: creepLimit,
        creepArgs: {
            style: 'reserve',
        },
    };

    let process = this.squad;
    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
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

directorRemote.prototype.doScouting = function() {
    if (!this.scout) {
        let proc = Game.kernel.startProcess(this, C.TASK_SCOUT, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.scout = proc;
    }
};

directorRemote.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let squadName = this.memory.workRoom + '_services';

    let process = Game.kernel.startProcess(this, imageName, {
        squadName: squadName,
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        return;
    }

    this.squad = process;
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
