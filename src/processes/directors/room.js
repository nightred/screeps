/*
 * Director Room
 *
 * runs processes to manage the room
 *
 */

var directorRoom = function() {
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

Object.defineProperty(Kernel.prototype, 'directorController', {
    get: function() {
        if (!this.memory.directorControllerPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorControllerPid);
    },
    set: function(value) {
        this.memory.directorControllerPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'directorResupply', {
    get: function() {
        if (!this.memory.directorResupplyPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorResupplyPid);
    },
    set: function(value) {
        this.memory.directorResupplyPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'directorHauling', {
    get: function() {
        if (!this.memory.directorHaulingPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorHaulingPid);
    },
    set: function(value) {
        this.memory.directorHaulingPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'directorStocking', {
    get: function() {
        if (!this.memory.directorStockingPid) return false;
        return Game.kernel.getProcessByPid(this.memory.directorStockingPid);
    },
    set: function(value) {
        this.memory.directorStockingPid = value.pid;
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
directorRoom.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.workRoom];

    if (!room || !room.controller || !room.controller.my) {
        return false;
    }

    this.doDirectors(task);

    Game.Mil.defense.doRoom(room);

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

directorRoom.prototype.doDirectors = function(task) {
    if (!this.directorMining) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_MINING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorMining = p;
    }

    if (!this.directorController) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_CONTROLLER, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorController = p;
    }

    if (!this.directorResupply) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_RESUPPLY, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorResupply = p;
    }

    if (!this.directorHauling) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_HAULING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorHauling = p;
    }

    if (!this.directorStocking) {
        let p = Game.kernel.startProcess(this, C.DIRECTOR_STOCKING, {
            workRoom: this.memory.workRoom,
            spawnRoom: this.memory.spawnRoom,
        });
        this.directorStocking = p;
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
directorRoom.prototype.flag = function(roomName, args) {
    this.memory.roomName = roomName;
    this.memory.spawnRoom = roomName;
};

registerProcess(C.DIRECTOR_ROOM, directorRoom);
