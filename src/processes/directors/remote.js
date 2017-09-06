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

Object.defineProperty(directorRemote.prototype, 'directorMining', {
    get: function() {
        if (!this.memory.directorMiningPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorMiningPid);
    },
    set: function(value) {
        this.memory.directorMiningPid = value.pid;
    },
});

Object.defineProperty(directorRemote.prototype, 'directorTech', {
    get: function() {
        if (!this.memory.directorTechPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorTechPid);
    },
    set: function(value) {
        this.memory.directorTechPid = value.pid;
    },
});

Object.defineProperty(directorRemote.prototype, 'managerDefense', {
    get: function() {
        if (!this.memory.managerDefensePid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerDefensePid);
    },
    set: function(value) {
        this.memory.managerDefensePid = value.pid;
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

/**
* @param {task} task the director task memory
**/
directorRemote.prototype.run = function() {
    if (isSleep(this)) return true;

    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    if (!this.squad) {
        this.initSquad();
    }

    this.doSquadGroupReserve();
    this.doSquadGroupInterHaulers();

    this.doDirectors();

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

directorRemote.prototype.doSquadGroupInterHaulers = function() {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 1 || rlevel == 2 || rlevel == 3 || rlevel == 4 {
        maxSize = 400;
    } else if (rlevel == 5 || rlevel == 6) {
        minSize = 400;
        maxSize = 600;
    } else if (rlevel == 7 || rlevel == 8) {
        minSize = 500;
        maxSize = 9999;
    }

    let creepLimit = 2;

    if (this.memory.creepLimit) {
        creepLimit = this.memory.creepLimit;
    }

    let record = {
        name: 'interhaulers',
        task: C.TASK_HAUL,
        role: C.ROLE_HAULER,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
        creepArgs: {
            style: 'longhauler',
        },
    };

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

directorRemote.prototype.doSquadGroupReserve = function() {
    let workRoom = Game.rooms[this.memory.workRoom];

    if (!workRoom || !workRoom.controller) {
        return;
    }

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

    if (!this.directorTech) {
        let proc = Game.kernel.startProcess(this, C.DIRECTOR_TECH, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorTech = proc;
    }

    if (!this.managerDefense) {
        let proc = Game.kernel.startProcess(this, 'managers/defense', {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.managerDefense = proc;
    }
};

directorRemote.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let squadName = this.memory.workRoom + '_services';

    let process = Game.kernel.startProcess(this, imageName, {
        name: squadName,
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        continue;
    }

    this.squad = process;
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorRemote.prototype.flag = function(roomName, args) {
    this.memory.workName = roomName;
    this.memory.spawnRoom = args[2];
};

registerProcess(C.DIRECTOR_REMOTE, directorRemote);
