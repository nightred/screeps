/*
 * Director Room
 *
 * runs processes to manage the room
 *
 */

var logger = new Logger('[Room Manager]');
logger.level = C.LOGLEVEL.DEBUG;

var directorRoom = function() {
    // init
}

Object.defineProperty(directorRoom.prototype, 'directorMining', {
    get: function() {
        if (!this.memory.directorMiningPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorMiningPid);
    },
    set: function(value) {
        this.memory.directorMiningPid = value.pid;
    },
});

Object.defineProperty(directorRoom.prototype, 'directorTech', {
    get: function() {
        if (!this.memory.directorTechPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorTechPid);
    },
    set: function(value) {
        this.memory.directorTechPid = value.pid;
    },
});

Object.defineProperty(directorRoom.prototype, 'managerDefense', {
    get: function() {
        if (!this.memory.managerDefensePid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerDefensePid);
    },
    set: function(value) {
        this.memory.managerDefensePid = value.pid;
    },
});

Object.defineProperty(directorRoom.prototype, 'squad', {
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
directorRoom.prototype.run = function() {
    let workRoom = Game.rooms[this.memory.workRoom];

    if (!workRoom || !workRoom.controller || !workRoom.controller.my) return;

    if (!this.squad) {
        this.initSquad();
    }

    this.doSquadGroupControllers();
    this.doSquadGroupResupply();
    this.doSquadGroupHaulers();
    this.doSquadGroupStockers();

    this.doDirectors();

    Game.kernel.sleepProcess(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorRoom.prototype.doSquadGroupStockers = function() {
    let workRoom = Game.rooms[this.memory.workRoom];

    if (!workRoom || !workRoom.storage || !workRoom.controller || !workRoom.controller.my) {
        return false;
    }

    let creepLimit = 0;

    if (_.filter(workRoom.getLinks(), structure =>
        structure.memory.type == 'storage').length > 0) {
        creepLimit = 1;
    }

    let record = {
        name: 'stockers',
        task: C.TASK_STOCK,
        role: C.ROLE_STOCKER,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
    };

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

directorRoom.prototype.doSquadGroupHaulers = function() {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 1 || rlevel == 2)  {
        maxSize = 300;
    } else if (rlevel == 3 || rlevel == 4) {
        maxSize = 400;
    } else if (rlevel == 5 || rlevel == 6) {
        maxSize = 500;
    } else if (rlevel == 7 || rlevel == 8) {
        maxSize = 9999;
    }

    let creepLimit = room.getSourceCount();

    if (_.filter(room.getContainers(), structure =>
        structure.memory.type == 'in').length <= 0) {
        creepLimit = 0;
    }

    let record = {
        name: 'haulers',
        task: C.TASK_HAUL,
        role: C.ROLE_HAULER,
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
        return;
    }

    process.setGroup(record);
};

directorRoom.prototype.doSquadGroupResupply = function() {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 4 || rlevel == 5 || rlevel == 6)  {
        maxSize = 500;
    } else if (rlevel == 7 || rlevel == 8) {
        maxSize = 9999;
    }

    let creepLimit = 2;

    let record = {
        name: 'resupply',
        task: C.TASK_RESUPPLY,
        role: C.ROLE_RESUPPLY,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
    };

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

directorRoom.prototype.doSquadGroupControllers = function() {
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

    let creepLimit = 2;
    if (spawnRoom.storage && spawnRoom.controller.level < 8 && spawnRoom.controller.level >= 4) {
        if (spawnRoom.storage.store[RESOURCE_ENERGY] < 50000 ) {
            creepLimit = 1;
        } else if (spawnRoom.storage.store[RESOURCE_ENERGY] < 80000 ) {
            creepLimit = 2;
        } else if (spawnRoom.storage.store[RESOURCE_ENERGY] < 150000 ) {
            creepLimit = 3;
        } else if (spawnRoom.storage.store[RESOURCE_ENERGY] < 200000 ) {
            creepLimit = 4;
        } else if (spawnRoom.storage.store[RESOURCE_ENERGY] >= 200000 ) {
            creepLimit = 5;
        }
    } else if (spawnRoom.controller.level == 8 ) {
        creepLimit = 1;
        this.memory.rcl8 = this.memory.rcl8 ? this.memory.rcl8 : 1;
    }

    let record = {
        name: 'controllers',
        task: C.TASK_UPGRADE,
        role: C.ROLE_CONTROLLER,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
    };

    if (this.memory.rcl8) {
        record.creepArgs = {
            rcl8: 1,
        };
    }

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

directorRoom.prototype.doDirectors = function() {
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
            spawnRoom: this.memory.workRoom,
        });
        this.managerDefense = proc;
    }
};

directorRoom.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let squadName = this.memory.workRoom + '_services';

    let process = Game.kernel.startProcess(this, imageName, {
        name: squadName,
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
directorRoom.prototype.flag = function(roomName, args) {
    this.memory.workRoom = roomName;
    this.memory.spawnRoom = roomName;
};

registerProcess(C.DIRECTOR_ROOM, directorRoom);
