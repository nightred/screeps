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
var EnergyGrid = function() {
    this.tick = this.tick || 0;
    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }
};

/**
* get an object to store energy in
* @param {Creep} creep
* @param {Number} energy The amount of energy
* @param {Array} types The storage types
**/
EnergyGrid.prototype.getStore = function(creep, energy, types) {
    if (!creep) { return -1; }
    if (isNaN(energy)) { return -1; }
    if(!Array.isArray(types)) { return -1; }
    if (!this.rooms[creep.room.name]) {
        if (!this.buildRoom(creep.room)) { return false; }
    }

    let target = false;
    for (let i = 0; i < types.length; i++) {
        if (!this.rooms[creep.room.name][types[i]]) { continue; }
        let mod = 1;
        if (types[i] == 'containerOut' ||
            types[i] == 'container'||
            types[i] == 'storage') {
            mod = 0.8;
        }
        let targets = _.filter(this.rooms[creep.room.name][types[i]], target =>
            target.energy < target.energyMax * mod);
        if (types[i] == 'extention') {
            targets = _.filter(targets, target => !creep.hasGoingTo(target.id));
        }
        targets = _.sortBy(targets, target => target.energy);
        if (targets.length <= 0) { continue; }
        target = creep.pos.findClosestByPath(targets, {maxOps: 500});
        if (target) { break; }
    }
    if (!target) { return false; }

    return Game.getObjectById(target.id);
};

/**
* get an object to withdraw energy from
* @param {Creep} creep
* @param {Number} energy The amount of energy
* @param {Array} types The storage types
**/
EnergyGrid.prototype.getWithdraw = function(creep, energy, types) {
    if (!creep) { return -1; }
    if (isNaN(energy)) { return -1; }
    if(!Array.isArray(types)) { return -1; }
    if (!this.rooms[creep.room.name]) {
        if (!this.buildRoom(creep.room)) { return false; }
    }

    let targetId = false;
    for (let i = 0; i < types.length; i++) {
        if (!this.rooms[creep.room.name][types[i]]) { continue; }
        if ((types[i] == 'spawn' || types[i] == 'extention') &&
            creep.room.energyAvailable <= C.ENERGY_ROOM_WITHDRAW_MIN) {
            continue;
        }
        let mod = 0;
        if (types[i] == 'containerIn') {
            mod = 0.15;
        }
        let targets = _.filter(this.rooms[creep.room.name][types[i]], target =>
            target.energy > target.energyMax * mod);
        targets = _.sortBy(targets, target => target.energy).reverse();
        if (types[i] == 'containerIn') {
            targets = _.filter(targets, target => !creep.hasGoingTo(target.id));
        }
        if (targets.length > 0) {
            targetId = targets[0].id;
            break;
        }
    }
    if (!targetId) { return false; }

    return Game.getObjectById(targetId);
};

/**
* create a listing of the storage locations for a room
* @param {Room} room The room to be used
**/
EnergyGrid.prototype.buildRoom = function(room) {
    if (!Game.rooms[room.name]) { return false; }
    this.rooms[room.name] = {};
    let energyMap = this.rooms[room.name];

    // storage
    energyMap.storage = {};
    if (room.storage) {
        let storage = room.storage;
        energyMap.storage[storage.id] = {
            id: storage.id,
            structure: 'storage',
            energy: storage.store[RESOURCE_ENERGY],
            energyMax: storage.storeCapacity,
            pos: storage.pos,
        };
    }

    // container
    energyMap.container = {};
    energyMap.containerIn = {};
    energyMap.containerOut = {};
    let containers = room.getContainers();
    if (containers.length > 0) {
        for (let i = 0; i < containers.length; i++) {
            let record = {
                id: containers[i].id,
                structure: 'container',
                energy: containers[i].store[RESOURCE_ENERGY],
                energyMax: containers[i].storeCapacity,
                type: containers[i].memory.type,
                pos: containers[i].pos,
            };
            switch (containers[i].memory.type) {
                case 'in':
                    energyMap.containerIn[containers[i].id] = record;
                    break;
                case 'out':
                    energyMap.containerOut[containers[i].id] = record;
                    break;
                default:
                    energyMap.container[containers[i].id] = record;
            };
        }
    }

    // link
    energyMap.linkStorage = {};
    energyMap.linkIn = {};
    energyMap.linkOut = {};
    let links = room.getLinks();
    if (links.length > 0) {
        for (let i = 0; i < links.length; i++) {
            let record = {
                id: links[i].id,
                structure: 'link',
                energy: links[i].energy,
                energyMax: links[i].energyCapacity,
                type: links[i].memory.type,
                pos: links[i].pos,
            };
            switch (links[i].memory.type) {
                case 'in':
                    energyMap.linkIn[links[i].id] = record;
                    break;
                case 'out':
                    energyMap.linkOut[links[i].id] = record;
                    break;
                case 'storage':
                    energyMap.linkStorage[links[i].id] = record;
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
                structure: 'spawn',
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
                structure: 'extention',
                energy: extentions[i].energy,
                energyMax: extentions[i].energyCapacity,
                pos: extentions[i].pos,
            };
        }
    }

    return true;
};

module.exports = EnergyGrid;
