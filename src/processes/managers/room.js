/*
 * Room Manager
 *
 * runs room managment processes
 *
 */

var logger = new Logger('[Room Manager]');

var RoomManager = function() {
    // init
};

_.merge(RoomManager.prototype, require('lib.cachelinks'));
_.merge(RoomManager.prototype, require('lib.links'));

Object.defineProperty(RoomManager.prototype, 'managerSpawn', {
    get: function() {
        if (!this.memory.managerSpawnPid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerSpawnPid);
    },
    set: function(value) {
        this.memory.managerSpawnPid = value.pid;
    },
});

Object.defineProperty(RoomManager.prototype, 'managerMarket', {
    get: function() {
        if (!this.memory.managerMarketPid) return false;
        return Game.kernel.getProcessByPid(this.memory.managerMarketPid);
    },
    set: function(value) {
        this.memory.managerMarketPid = value.pid;
    },
});

RoomManager.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    if (!this.memory.lastVision) this.memory.lastVision = Game.time;
    let room = Game.rooms[this.memory.roomName];
    if (!room) {
        if (this.memory.lastVision + C.MANAGER_ROOM_VISION_MAX < Game.time) {
            logger.info(this.memory.roomName + ' has not been had vision for extended time, removing manager');
            Game.kernel.killProcess(this.pid);
        }
        return;
    }
    this.memory.lastVision = Game.time;

    // clean memory
    if (!this.memory.sleepCleanup || this.memory.sleepCleanup < Game.time) {
        this.cleanContainers(room);
        this.cleanTowers(room);
        this.cleanLinks(room);
        this.memory.sleepCleanup = C.MANAGE_MEMORY_TICKS + Game.time;
    }

    // controller room processes
    if (room.controller && room.controller.my) {
        this.cacheRoomLinks(room);
        this.doLinks(room);

        let towers = room.getTowers();
        if (towers.length > 0) towers.forEach((tower) => this.doTower(tower));

        this.doManagers();
    }

    // defense status
    this.defenseStatus(room);

    addTerminalLog(room.name, {
        command: 'manager',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });
};

RoomManager.prototype.defenseStatus = function(room) {
    let defense = room.memory.defense;
    if (defense && defense.active) {
        let cooldown = undefined;
        if (defense.cooldown)
            cooldown = (defense.cooldown + C.DEFENSE_COOLDOWN) - Game.time;

        addDefenseVisual(room.name, {
            ticks: (Game.time - defense.tick),
            cooldown: cooldown,
        });
    }
};

RoomManager.prototype.cleanContainers = function(room) {
    for (let containerId in room.memory.structureContainers) {
        if (!Game.getObjectById(containerId)) {
            delete room.memory.structureContainers[containerId];
            logger.debug('clearing non-existant container: ' + containerId);
        }
    }

    let targets = room.getContainers();
    for (let target of targets) {
        if (!target.memory.type) target.memory.type = 'default';
    }
};

RoomManager.prototype.cleanTowers = function(room) {
    for (let towerId in room.memory.structureTowers) {
        if (!Game.getObjectById(towerId)) {
            delete room.memory.structureTowers[towerId];
            logger.debug('clearing non-existant tower: ' + towerId);
        }
    }
};

RoomManager.prototype.cleanLinks = function(room) {
    for (let linkId in room.memory.structureLinks) {
        if (!Game.getObjectById(linkId)) {
            delete room.memory.structureLinks[linkId];
            logger.debug('clearing non-existant link: ' + linkId);
        }
    }
};

RoomManager.prototype.doTower = function(tower) {
    if (this.doTowerDefence(tower)) return;
    if (this.doTowerHeal(tower)) return;
    if (this.doTowerRepair(tower)) return;
};

RoomManager.prototype.doTowerDefence = function(tower) {
    let targets = tower.room.getHostiles();
    targets = _.filter(targets, creep =>
        creep.owner &&
        !isAlly(creep.owner.username)
    );

    if (!targets || targets.length === 0) return false;
    targets = _.sortBy(targets, hostile => hostile.hits);

    tower.attack(targets[0]);
    return true
};

RoomManager.prototype.doTowerHeal = function(tower) {
    let targets = tower.room.getCreeps();
    if (!targets || targets.length == 0) return false;

    targets = _.filter(targets, creep => creep.hits < creep.hitsMax);
    if (!targets || targets.length == 0) return false;

    targets = _.sortBy(targets, creep => creep.hits);

    tower.heal(targets[0]);
    return true;
};

RoomManager.prototype.doTowerRepair = function(tower) {
    if (tower.memory.sleepTowerRepair && tower.memory.sleepTowerRepair > Game.time) return false;
    tower.memory.sleepTowerRepair = C.TOWER_REPAIR_TICKS + Game.time;

    if (!this.cacheTick || this.cacheTick < Game.time) {
        this.roomCache = [];
        this.buildCache();
        this.cacheTick = Game.time;
    }

    if (tower.energy < C.ENERGY_TOWER_REPAIR_MIN) return false;
    if (this.roomCache.length === 0) return false;

    let maxHits = Math.max.apply(null, this.roomCache.map(function(o) {
        return o.hits;
    }));

    let targets = _.sortBy(this.roomCache, structure =>
        Math.abs(4 - tower.pos.getRangeTo(structure)) +
        (100 * (structure.hits / maxHits))
    );
    if (targets.length === 0) return false;

    tower.repair(targets[0]);
    return true;
};

RoomManager.prototype.buildCache = function() {
    let room = Game.rooms[this.memory.roomName];
    let mod = 0;

    if (room.storage) {
        let energyStorage = room.storage.store[RESOURCE_ENERGY];

        if (energyStorage < 10000) {
            mod = 0.1;
        } else if (energyStorage < 100000) {
            mod = 1;
        } else if (energyStorage < 200000) {
            mod = 5;
        } else if (energyStorage < 300000) {
            mod = 10;
        } else if (energyStorage < 350000) {
            mod = 50;
        } else if (energyStorage < 400000) {
            mod = 100;
        } else if (energyStorage < 450000) {
            mod = 1000;
        } else if (energyStorage >= 500000) {
            mod = 3000;
        }
    }

    let maxHitRampart = C.RAMPART_HIT_MAX * mod;
    let maxHitWall = C.WALL_HIT_MAX * mod;

    let structures = room.getStructures();
    if (!structures || structures.length === 0) return false;

    _.filter(structures, structure =>
        (structure.structureType != STRUCTURE_WALL &&
        structure.structureType != STRUCTURE_RAMPART) &&
        structure.hits < Math.floor(structure.hitsMax * 0.3)
        ).forEach(structure => this.roomCache.push(structure));

    _.filter(structures, structure =>
        (structure.structureType == STRUCTURE_RAMPART &&
        (structure.hits < maxHitRampart &&
        structure.hitsMax > structure.hits)) ||
        (structure.structureType == STRUCTURE_WALL &&
        (structure.hits < maxHitWall &&
        structure.hitsMax > structure.hits))
        ).forEach(structure => this.roomCache.push(structure));
};

RoomManager.prototype.doManagers = function() {
    if (!this.managerSpawn) {
        let proc = Game.kernel.startProcess(this, 'managers/spawn', {
            roomName: this.memory.roomName,
        });
        this.managerSpawn = proc;
    }

    if (!this.managerMarket) {
        let proc = Game.kernel.startProcess(this, 'managers/market', {
            roomName: this.memory.roomName,
        });
        this.managerMarket = proc;
    }
};

registerProcess('managers/room', RoomManager);
