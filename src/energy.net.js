/*
 * Energy Net system
 *
 * energy net records the energy needs of a room
 * provides storage and provider locations for energy
 *
 */

 /**
 * create the empty object to store all room energy targets
 **/
var EnergyNet = function() {
    this.tick = this.tick || 0;
    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }
};

/**
* get an object to store energy in
* @param {Room} room The room to be used
* @param {Number} energy The amount of energy
* @param {Array} types The storage types
**/
EnergyNet.prototype.getStore = function(room, energy, types) {
    if (!room) { return -1; }
    if (isNaN(energy)) { return -1; }
    if(!Array.isArray(types)) { return -1; }
    if (!this.rooms[room.name]) {
        if (!this.buildRoom(room)) { return false; }
    }

    let targetId = false;
    for (let i = 0; i < types.length; i++) {
        if (!this.rooms[room.name][types[i]]) { continue; }
        let type = this.rooms[room.name][types[i]];
        for (let id in type) {
            if (type[id].energy < type[id].energyMax) {
                type[id].energy += energy;
                type[id].energy = type[id].energy > type[id].energyMax ? type[id].energyMax : type[id].energy;
                targetId = id;
                break;
            }
        }
        if (targetId) { break; }
    }

    return Game.getObjectById(targetId);
};

/**
* get an object to withdraw energy from
* @param {Room} room The room to be used
* @param {Number} energy The amount of energy
* @param {Array} types The storage types
**/
EnergyNet.prototype.getWithdraw = function(room, energy, types) {
    if (!room) { return -1; }
    if (isNaN(energy)) { return -1; }
    if(!Array.isArray(types)) { return -1; }
    if (!this.rooms[room.name]) {
        if (!this.buildRoom(room)) { return false; }
    }

    let targetId = false;
    for (let i = 0; i < types.length; i++) {
        if (!this.rooms[room.name][types[i]]) { continue; }
        let type = this.rooms[room.name][types[i]];
        for (let id in type) {
            if (type[id].energy > 0) {
                type[id].energy -= energy;
                type[id].energy = type[id].energy < 0 ? 0 : type[id].energy;
                targetId = id;
                break;
            }
        }
        if (targetId) { break; }
    }
    if (!targetId) { return false; }

    return Game.getObjectById(targetId);
};

/**
* create a listing of the storage locations for a room
* @param {Room} room The room to be used
**/
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
            pos: storage.pos,
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
                pos: containers[i].pos,
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
                pos: spawns[i].pos,
            };
        }
    }

    // extention
    energyMap.extention = {};
    let extentions = room.getExtensions();
    if (extentions.length > 0) {
        for (let i = 0; i < extentions.length; i++) {
            energyMap.extention[extentions[i].id] = {
                id: extentions[i].id,
                energy: extentions[i].energy,
                energyMax: extentions[i].energyCapacity,
                pos: extentions[i].pos,
            };
        }
    }

    return true;
};

module.exports = EnergyNet;
