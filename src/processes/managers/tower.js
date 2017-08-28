/*
 * Tower managment
 *
 * Provides functions for towers
 *
 */

var Tower = function() {
    this.tick = this.tick || 0;
    this.rooms = {};
};

Tower.prototype.run = function()  {
    let cpuStart = Game.cpu.getUsed();

    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }

    let room = Game.rooms[this.memory.roomName];

    if (room) {
        let towers = room.getTowers();

        if (towers.length > 0) {
            towers.forEach((tower) => this.doTower(tower));
        }
    }

    addTerminalLog(room.name, {
        command: 'towers',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });
};

Tower.prototype.doTower = function(tower) {
    if (!tower) { return ERR_INVALID_ARGS; }

    if (this.defence(tower)) {
        return true;
    }
    if (this.heal(tower)) {
        return true;
    }
    if (this.repair(tower)) {
        return true;
    }

    return false;

};

Tower.prototype.defence = function(tower) {
    let targets = tower.room.getHostiles();

    targets = _.filter(targets, creep =>
        creep.owner &&
        !Game.Mil.isAlly(creep.owner.username));
    if (!targets || targets.length == 0) { return false; }
    targets = _.sortBy(targets, hostile => hostile.hits);

    tower.attack(targets[0]);

    return true
};

Tower.prototype.heal = function(tower) {
    let targets = tower.room.getCreeps();
    if (!targets || targets.length == 0) { return false; }
    targets = _.filter(targets, creep => creep.hits < creep.hitsMax);
    if (!targets || targets.length == 0) { return false; }
    targets = _.sortBy(targets, creep => creep.hits);

    tower.heal(targets[0]);

    return true;
};

Tower.prototype.repair = function(tower) {
    tower.memory.repairTick = tower.memory.repairTick || 0;
    if ((tower.memory.repairTick + C.TOWER_REPAIR_TICKS) > Game.time) {
        return true;
    }
    tower.memory.repairTick = Game.time;

    if (tower.energy < C.ENERGY_TOWER_REPAIR_MIN) {
        return true;
    }

    if (!this.rooms[tower.room.name]) {
        if (!this.buildCache(tower.room.name)) { return false; }
    }

    let roomCache = this.rooms[tower.room.name];
    if (roomCache.length == 0) { return false; }

    let maxHits = Math.max.apply(null, roomCache.map(function(o) { return o.hits; }));

    let targets = _.sortBy(roomCache, structure =>
        Math.abs(4 - tower.pos.getRangeTo(structure)) +
        (100 * (structure.hits / maxHits))
    );

    tower.repair(targets[0]);

    return true;
};

Tower.prototype.buildCache = function(roomName) {
    if (!Game.rooms[roomName]) { return ERR_INVALID_ARGS; }

    this.rooms[roomName] = [];

    let room = Game.rooms[roomName];
    let roomCache = this.rooms[roomName];

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
    if (!structures || structures.length == 0) { return false; }

    _.filter(structures, structure =>
        (structure.structureType != STRUCTURE_WALL &&
        structure.structureType != STRUCTURE_RAMPART) &&
        structure.hits < Math.floor(structure.hitsMax * 0.3)
        ).forEach(structure => roomCache.push(structure));
    _.filter(structures, structure =>
        (structure.structureType == STRUCTURE_RAMPART &&
        (structure.hits < maxHitRampart &&
        structure.hitsMax > structure.hits)) ||
        (structure.structureType == STRUCTURE_WALL &&
        (structure.hits < maxHitWall &&
        structure.hitsMax > structure.hits))
        ).forEach(structure => roomCache.push(structure));

    return true;
};

registerProcess('managers/tower', Tower);
