/*
 * Director Room
 *
 * runs processes to manage the room
 *
 */

var logger = new Logger('[Room Manager]');

var directorRoom = function() {
    // init
};

_.merge(directorRoom.prototype, require('lib.containers'));
_.merge(directorRoom.prototype, require('lib.sources'));
_.merge(directorRoom.prototype, require('lib.defense'));

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

Object.defineProperty(directorRoom.prototype, 'taskUpgraders', {
    get: function() {
        if (!this.memory.upgradersPid) return false;
        return Game.kernel.getProcessByPid(this.memory.upgradersPid);
    },
    set: function(value) {
        this.memory.upgradersPid = value.pid;
    },
});

Object.defineProperty(directorRoom.prototype, 'taskResuppliers', {
    get: function() {
        if (!this.memory.resuppliersPid) return false;
        return Game.kernel.getProcessByPid(this.memory.resuppliersPid);
    },
    set: function(value) {
        this.memory.resuppliersPid = value.pid;
    },
});

Object.defineProperty(directorRoom.prototype, 'taskStockers', {
    get: function() {
        if (!this.memory.stockersPid) return false;
        return Game.kernel.getProcessByPid(this.memory.stockersPid);
    },
    set: function(value) {
        this.memory.stockersPid = value.pid;
    },
});

/**
* @param {task} task the director task memory
**/
directorRoom.prototype.run = function() {
    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom || !workRoom.controller || !workRoom.controller.my) return;

    this.doDefense();

    this.doDirectors();
    this.doTasks();

    // remove old Haulers
    if (this.memory.haulersPid) {
        Game.kernel.killProcess(this.memory.haulersPid);
        this.memory.haulersPid = undefined;
    }

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorRoom.prototype.doTasks = function() {
    if (!this.taskStockers) {
        let process = Game.kernel.startProcess(this, C.TASK_STOCK, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.taskStockers = process;
    }

    if (!this.taskResuppliers) {
        let process = Game.kernel.startProcess(this, C.TASK_RESUPPLY, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.taskResuppliers = process;
    }

    if (!this.taskUpgraders) {
        let process = Game.kernel.startProcess(this, C.TASK_UPGRADE, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.taskUpgraders = process;
    }
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
