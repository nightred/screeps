/*
 * Energy Net system
 *
 * energy net records the energy needs of a room
 * provides storage and provider locations for energy
 *
 */

var EnergyNet = function() {
    this.tick = this.tick || 0;
    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }
};

EnergyNet.prototype.getStore = function(room, energy, types) {
    if (!room) { return -1; }
    if (isNaN(energy)) { return -1; }
    if(!Array.isArray(types)) { return -1; }
    if (!this.rooms[room.name]) {
        this.buildRoom(room);
    }

    return false;
};

EnergyNet.prototype.getWithdraw = function(room, energy, types) {
    if (!room) { return -1; }
    if (isNaN(energy)) { return -1; }
    if(!Array.isArray(types)) { return -1; }
    if (!this.rooms[room.name]) {
        this.buildRoom(room);
    }

    return false;
};

EnergyNet.prototype.buildRoom = function(room) {
    if (!Game.rooms[room.name]) { return false; }
    this.rooms[room.name] = {};
    let energyMap = this.rooms[room.name];

    // storage
    energyMap.storage = {};
    if (room.storage) {
        let storage = room.storage;
        energyMap.storage[storage.id] = {
            id: storage.id,
            energy: storage.store[RESOURCE_ENERGY],
            energyMax: storage.storeCapacity,
        };
    }

    // container
    energyMap.container = {};
    let containers = room.getContainers();
    if (containers.length > 0) {
        for (let i = 0; i < containers.length; i++) {
            energyMap.container[containers[i].id] = {
                id: containers[i].id,
                energy: containers[i].store[RESOURCE_ENERGY],
                energyMax: containers[i].storeCapacity,
                type: containers[i].memory.type,
            };
        }
    }

    // spawn
    energyMap.spawn = {};
    let spawns = room.getSpawns();
    if (spawns.length > 0) {
        for (let i = 0; i < spawns.length; i++) {
            energyMap.spawn[spawns[i].id] = {
                id: spawns[i].id,
                energy: spawns[i].energy,
                energyMax: spawns[i].energyCapacity,
            };
        }
    }

    // extention
    energyNet.extention = {};
    let extentions = room.getExtensions();
    if (extentions.length > 0) {
        for (let i = 0; i < extentions.length; i++) {
            energyMap.extention[extentions[i].id] = {
                id: extentions[i].id,
                energy: extentions[i].energy,
                energyMax: extentions[i].energyCapacity,
            };
        }
    }
};

module.exports = EnergyNet;
