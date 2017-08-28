/*
 * Storage system
 *
 * storage records the storage locations of a room
 * provides locations to store or withdraw from
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Storage]');
logger.level = C.LOGLEVEL.DEBUG;

 /**
 * create the object for room storage objects
 **/
var Storage = function() {
    this.tick = Game.time;
    this.rooms = {};
};

/**
* get an object to store in
* @param {Creep} creep
* @param {Number} amount The amount of carry
* @param {Array} types The storage types
**/
Storage.prototype.getStore = function(creep, amount, types) {
    if (!creep || isNaN(amount) || !Array.isArray(types)) {
        return ERR_INVALID_ARGS;
    }

    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }

    if (!this.rooms[creep.room.name]) {
        if (!this.buildRoom(creep.room)) {
            logger.error('failed to build room cache ' + creep.room.name);
            return false;
        }
    }

    let target = false;

    for (let i = 0; i < types.length; i++) {
        if (!this.rooms[creep.room.name][types[i]]) { continue; }

        let mod = 1;

        if (types[i] == 'containerOut' ||
            types[i] == 'container' ) {
            mod = C.ENERGY_CONTAINER_MAX;
        } else if (types[i] == 'terminal') {
            mod = C.TERMINAL_ENERGY_MAX;
        }  else if (types[i] == 'storage') {
            mod = C.ENERGY_STORAGE_MAX;
        }

        let targets = _.filter(this.rooms[creep.room.name][types[i]], target =>
            target.store < target.storeMax * mod);

        if (types[i] == 'extention') {
            targets = _.filter(targets, target => !creep.hasGoingTo(target.id));
        }
        targets = _.sortBy(targets, target => target.store);

        if (targets.length <= 0) continue;

        target = creep.pos.findClosestByRange(targets);

        return Game.getObjectById(target.id);
    }

    return false;
};

/**
* get an object to withdraw energy from
* @param {Creep} creep
* @param {Number} amount The amount of carry
* @param {Array} types The storage types
**/
Storage.prototype.getWithdraw = function(creep, amount, types) {
    if (!creep || isNaN(amount) || !Array.isArray(types)) {
        return ERR_INVALID_ARGS;
    }

    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }

    if (!this.rooms[creep.room.name]) {
        if (!this.buildRoom(creep.room)) {
            logger.error('failed to build room cache ' + creep.room.name);
            return false;
        }
    }

    let target = undefined;

    for (let i = 0; i < types.length; i++) {
        if (!this.rooms[creep.room.name][types[i]]) continue;

        if ((types[i] == 'spawn' || types[i] == 'extention') &&
            creep.room.energyAvailable <= C.ENERGY_ROOM_WITHDRAW_MIN) {
            continue;
        }

        let mod = 0;

        if (types[i] == 'containerIn') {
            mod = 0.15;
        }

        let targets = _.filter(this.rooms[creep.room.name][types[i]], target =>
            target.store > target.storeMax * mod);
        targets = _.sortBy(targets, target => target.store).reverse();

        if (types[i] == 'containerIn') {
            targets = _.filter(targets, target => !creep.hasGoingTo(target.id));
        }

        if (targets.length <= 0) continue;

        target = creep.pos.findClosestByRange(targets);

        return Game.getObjectById(target);
    }

    return false;
};

/**
* create a listing of the storage locations for a room
* @param {Room} room The room to be used
**/
Storage.prototype.buildRoom = function(room) {
    if (!Game.rooms[room.name]) { return false; }

    this.rooms[room.name] = {};

    let records = this.rooms[room.name];

    // storage
    records.storage = {};

    if (room.storage) {
        let storage = room.storage;
        records.storage[storage.id] = {
            id: storage.id,
            store: _.sum(storage.store),
            storeMax: storage.storeCapacity,
            pos: storage.pos,
        };
    }

    // terminal
    records.terminal = {};

    if (room.terminal) {
        let terminal = room.terminal;
        records.terminal[terminal.id] = {
            id: terminal.id,
            store: _.sum(terminal.store),
            storeMax: terminal.storeCapacity,
            pos: terminal.pos,
        };
    }

    // container
    records.container = {};
    records.containerIn = {};
    records.containerOut = {};

    let containers = room.getContainers();

    if (containers.length > 0) {
        for (let i = 0; i < containers.length; i++) {
            let record = {
                id: containers[i].id,
                store: _.sum(containers[i].store),
                storeMax: containers[i].storeCapacity,
                type: containers[i].memory.type,
                pos: containers[i].pos,
            };
            switch (containers[i].memory.type) {
                case 'in':
                    records.containerIn[containers[i].id] = record;
                    break;
                case 'out':
                    records.containerOut[containers[i].id] = record;
                    break;
                default:
                    records.container[containers[i].id] = record;
            };
        }
    }

    // link
    records.linkStorage = {};
    records.linkIn = {};
    records.linkOut = {};

    let links = room.getLinks();

    if (links.length > 0) {
        for (let i = 0; i < links.length; i++) {
            let record = {
                id: links[i].id,
                store: links[i].energy,
                storeMax: links[i].energyCapacity,
                type: links[i].memory.type,
                pos: links[i].pos,
            };
            switch (links[i].memory.type) {
                case 'in':
                    records.linkIn[links[i].id] = record;
                    break;
                case 'out':
                    records.linkOut[links[i].id] = record;
                    break;
                case 'storage':
                    records.linkStorage[links[i].id] = record;
            };
        }
    }

    // spawn
    records.spawn = {};

    let spawns = room.getSpawns();

    if (spawns.length > 0) {
        for (let i = 0; i < spawns.length; i++) {
            records.spawn[spawns[i].id] = {
                id: spawns[i].id,
                store: spawns[i].energy,
                storeMax: spawns[i].energyCapacity,
                pos: spawns[i].pos,
            };
        }
    }

    // extention
    records.extention = {};

    let extentions = room.getExtensions();

    if (extentions.length > 0) {
        for (let i = 0; i < extentions.length; i++) {
            records.extention[extentions[i].id] = {
                id: extentions[i].id,
                store: extentions[i].energy,
                storeMax: extentions[i].energyCapacity,
                pos: extentions[i].pos,
            };
        }
    }

    // nuker
    records.nuker = {};

    let nuker = room.getNuker();

    if (nuker) {
        records.nuker[nuker.id] = {
            id: nuker.id,
            store: nuker.energy,
            storeMax: nuker.energyCapacity,
            pos: nuker.pos,
        };
    }

    // powerspawn
    records.powerspawn = {};

    let powerspawn = room.getPowerSpawn();

    if (powerspawn) {
        records.powerspawn[powerspawn.id] = {
            id: powerspawn.id,
            store: powerspawn.energy,
            storeMax: powerspawn.energyCapacity,
            pos: powerspawn.pos,
        };
    }

    return true;
};

let storage = new Storage();

global.getStorageStore = function(creep, amount, types) {
    return storage.getStore(creep, amount, types);
};

global.getStorageWithdraw = function(creep, amount, types) {
    return storage.getWithdraw(creep, amount, types);
};
