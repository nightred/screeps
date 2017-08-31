/*
 * Director Remote
 *
 * runs processes to manage Remote rooms
 *
 */

var directorRemote = function() {
    // init
}

Object.defineProperty(Kernel.prototype, 'directorMining', {
    get: function() {
        if (!this.memory.directorMiningPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorMiningPid);
    },
    set: function(value) {
        this.memory.directorMiningPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'directorReserve', {
    get: function() {
        if (!this.memory.directorReservePid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorReservePid);
    },
    set: function(value) {
        this.memory.directorReservekPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'directorInterhauling', {
    get: function() {
        if (!this.memory.directorInterhaulingPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorInterhaulingPid);
    },
    set: function(value) {
        this.memory.directorInterhaulingPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'directorTech', {
    get: function() {
        if (!this.memory.directorTechPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorTechPid);
    },
    set: function(value) {
        this.memory.directorTechPid = value.pid;
    },
});

/**
* @param {task} task the director task memory
**/
directorRemote.prototype.run = function() {
    if (isSleep(this)) return true;

    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) {
        return false;
    }

    this.doDirectors();

    let workRoom = Game.rooms[this.memory.workRoom];

    if (workRoom) {
        Game.Mil.defense.doRoom(workRoom, spawnRoom);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

/**
* @param {task} task the director task memory
**/
directorRemote.prototype.doDirectors = function() {
    if (!this.directorMining) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_MINING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorMining = p;
    }

    if (!this.directorReserve) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_RESERVE, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorReserve = p;
    }

    if (!this.directorInterhauling) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_INTERHAULING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorInterhauling = p;
    }

    if (!this.directorTech) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_TECH, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorTech = p;
    }
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorRemote.prototype.flag = function(roomName, args) {
    this.memory.roomName = roomName;
    this.memory.spawnRoom = args[2];
};

registerProcess(C.DIRECTOR_CONTROLLER, directorRemote);
