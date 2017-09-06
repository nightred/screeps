/*
 * Room Manager
 *
 * runs room managment processes
 *
 */

var logger = new Logger('[Room Manager]');
logger.level = C.LOGLEVEL.DEBUG;

var RoomManager = function() {
    // init
};

Object.defineProperty(Kernel.prototype, 'managerLink', {
    get: function() {
        if (!this.memory.managerLinkPid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerLinkPid);
    },
    set: function(value) {
        this.memory.managerLinkPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'managerSpawn', {
    get: function() {
        if (!this.memory.managerSpawnPid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerSpawnPid);
    },
    set: function(value) {
        this.memory.managerSpawnPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'managerTower', {
    get: function() {
        if (!this.memory.managerTowerPid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerTowerPid);
    },
    set: function(value) {
        this.memory.managerTowerPid = value.pid;
    },
});

RoomManager.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    let room = Game.rooms[this.memory.roomName];

    if (room) {
        // clean memory
        this.gcContainers(room);
        this.gcTowers(room);
        this.gcLinks(room);

        // controller room processes
        if (room.controller && room.controller.my) {
            this.doManagers();
        }

        let defense = room.memory.defense;

        if (defense && defense.active) {
            let args = {
                ticks: Game.time - defense.tick,
            };

            if (defense.cooldown) {
                args.cooldown = (defense.cooldown + C.DEFENSE_COOLDOWN) - Game.time;
            }

            addDefenseVisual(room.name, args);
        }
    }

    addTerminalLog(room.name, {
        command: 'manager',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    })
};

RoomManager.prototype.gcContainers = function(room) {
    room.memory.containersMemory = room.memory.containersMemory || 0;
    if ((room.memory.containersMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.containersMemory = Game.time;

    for (let containerId in room.memory.structureContainers) {
        if (!Game.getObjectById(containerId)) {
            delete room.memory.structureContainers[containerId];
            logger.debug('clearing non-existant container: ' + containerId);
        }
    }

    var targets = room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
        }
    });

    for (let target of targets) {
        if (!target.memory.type) {
            target.memory.type = 'default';
        }
    }

    return true;
};

RoomManager.prototype.gcTowers = function(room) {
    room.memory.towersMemory = room.memory.towersMemory || 0;
    if ((room.memory.towersMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.towersMemory = Game.time;

    for (let towerId in room.memory.structureTowers) {
        if (!Game.getObjectById(towerId)) {
            delete room.memory.structureTowers[towerId];
            logger.debug('clearing non-existant tower: ' + towerId);
        }
    }

    return true;
};

RoomManager.prototype.gcLinks = function(room) {
    room.memory.linksMemory = room.memory.linksMemory || 0;
    if ((room.memory.linksMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.linksMemory = Game.time;

    for (let linkId in room.memory.structureLinks) {
        if (!Game.getObjectById(linkId)) {
            delete room.memory.structureLinks[linkId];
            logger.debug('clearing non-existant link: ' + linkId);
        }
    }

    return true;
};

RoomManager.prototype.doManagers = function() {
    let roomName = this.memory.roomName;

    if (!this.managerTower) {
        let p = Game.kernel.startProcess(this, 'managers/tower', {
            roomName: roomName,
        });
        this.managerTower = p;
    }

    if (!this.managerLink) {
        let p = Game.kernel.startProcess(this, 'managers/link', {
            roomName: roomName,
        });
        this.managerLink = p;
    }

    if (!this.managerSpawn) {
        let p = Game.kernel.startProcess(this, 'managers/spawn', {
            roomName: roomName,
        });
        this.managerSpawn = p;
    }
};

RoomManager.prototype.doDirectorFlag = function(flag) {
    if (!flag.memory.init) {
        let flagVars = flag.name.split(':');
        let roomName = flag.pos.roomName;

        if (C.DIRECTOR_FLAG_MAP.indexOf(flagVars[1]) == -1) {
            logger.debug('invalid director type requested by flag: ' + flag.name);
            flag.memory.result = 'invalid director';
            return;
        }

        let imageName = C.DIRECTOR_FLAG_MAP[flagVars[1]];

        let process = Game.kernel.startProcess(this, imageName, {});

        process.flag(roomName, flagVars)

        flag.memory.pid = process.pid;
        flag.memory.init = 1;
    }
};

registerProcess('managers/room', RoomManager);
