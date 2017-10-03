/*
 * task Stock
 *
 * stock manages the filling of links and structures
 *
 */

var taskStock = function() {
    // init
};

_.merge(taskStock.prototype, require('lib.cachelinks'));
_.merge(taskStock.prototype, require('lib.spawncreep'));

Object.defineProperty(taskStock.prototype, 'marketData', {
    get: function() {
        Memory.world = Memory.world || {};
        Memory.world.market = Memory.world.market || {};
        return Memory.world.market;
    },
    set: function(value) {
        Memory.world = Memory.world || {};
        Memory.world.market = Memory.world.market || {};
        Memory.world.market = value;
    },
});

taskStock.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    this.doSpawnDetails();
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskStock.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) return;

    this.manageState(creep);
    if (creep.state == 'wait') {
        creep.sleep();
    } else if (creep.state == 'filllink') {
        this.doFillLink(creep);
    } else if (creep.state == 'emptylink') {
        this.doEmptyLink(creep);
    } else if (creep.state == 'storestorage' || creep.state == 'store') {
        this.doStoreStorage(creep);
    } else if (creep.state == 'surplustomarket') {
        this.doSurplusToMarket(creep);
    } else if (creep.state == 'storeterminal') {
        this.doStoreTerminal(creep);
    } else if (creep.state == 'fillterminal') {
        this.doFillTerminal(creep);
    }
};

taskStock.prototype.doFillLink = function(creep) {
    let storage = creep.room.storage;
    if (!storage) return;

    if (storage.store[RESOURCE_ENERGY] < 5000) {
        this.state = 'wait';
        return;
    }

    if ((_.sum(creep.carry) - creep.carry[RESOURCE_ENERGY]) > 0) {
        creep.doTransfer(storage);
        return;
    }

    if (creep.isEmptyEnergy()) {
        creep.doWithdraw(storage, RESOURCE_ENERGY);
        return;
    }

    let linksStorage = this.getRoomLinksStorage(creep.room);
    if (linksStorage.length === 0) return;

    let storageLink = Game.getObjectById(linksStorage[0]);
    if (!storageLink) return;

    let linkEnergyMax = storageLink.energyCapacity * C.LINK_STORAGE_MAX_ENERGY;
    if (storageLink.energy > linkEnergyMax) {
        creep.state = 'emptylink';
        return;
    }

    creep.doTransfer(storageLink, RESOURCE_ENERGY);
    creep.state = 'wait';
};

taskStock.prototype.doEmptyLink = function(creep) {
    if (!creep.isEmpty()) {
        let storage = creep.room.storage;
        if (!storage) return;

        creep.doTransfer(storage);
        return;
    }

    let linksStorage = this.getRoomLinksStorage(creep.room);
    if (linksStorage.length === 0) return;

    let storageLink = Game.getObjectById(linksStorage[0]);
    if (!storageLink) return;

    creep.doWithdraw(storageLink, RESOURCE_ENERGY);
    creep.state = 'storestorage';
};

taskStock.prototype.doStoreStorage = function(creep) {
    if (!creep.isEmpty()) {
        let storage = creep.room.storage;
        if (!storage) return;

        creep.doTransfer(storage);
        return;
    }

    creep.state = 'wait';
};

taskStock.prototype.doStoreTerminal = function(creep) {
    if (!creep.isEmpty()) {
        let terminal = creep.room.terminal;
        if (!terminal) return;

        creep.doTransfer(terminal);
        return;
    }

    creep.state = 'wait';
};

taskStock.prototype.doSurplusToMarket = function(creep) {
    let storage = creep.room.storage;
    let terminal = creep.room.terminal;
    if (!storage || !terminal) return;

    if (!this.marketData[creep.room.name]) return;
    if (!this.marketData[creep.room.name].surplus) return;

    let surplus = this.marketData[creep.room.name].surplus;
    let resources = Object.keys(surplus);

    creep.doWithdraw(storage, resources[0]);

    surplus[resources[0]] -= creep.carryCapacity;
    if (surplus[resources[0]] <= 0) delete surplus[resources[0]];

    creep.state = 'storeterminal';
};

taskStock.prototype.doFillTerminal = function(creep) {
    let storage = creep.room.storage;
    if (!storage) return;

    creep.doWithdraw(storage, RESOURCE_ENERGY);

    creep.state = 'storeterminal';
};

// check the state of the stocker
taskStock.prototype.manageState = function(creep) {
    if (creep.state == 'init') creep.state = 'wait';

    if (creep.state == 'wait') {
        if (this.stateEmptyLink(creep)) return;
        if (this.stateFillLink(creep)) return;
        if (this.stateTransferToMarket(creep)) return;
        if (this.stateFillTerminal(creep)) return;
    }
};

taskStock.prototype.stateEmptyLink = function(creep) {
    if (!creep.room.storage) return;

    let linksStorage = this.getRoomLinksStorage(creep.room);
    if (linksStorage.length === 0) return;

    let storageLink = Game.getObjectById(linksStorage[0]);
    if (!storageLink) return;

    let linkEnergyMax = storageLink.energyCapacity * C.LINK_STORAGE_MAX_ENERGY;
    if (storageLink.energy > linkEnergyMax) {
        creep.state = 'emptylink';
        return true;
    }
};

taskStock.prototype.stateFillLink = function(creep) {
    if (!creep.room.storage) return;

    if (creep.room.storage.store[RESOURCE_ENERGY] < 5000) return;

    let linksStorage = this.getRoomLinksStorage(creep.room);
    if (linksStorage.length === 0) return;

    let storageLink = Game.getObjectById(linksStorage[0]);
    if (!storageLink) return;

    let linkEnergyMax = storageLink.energyCapacity * C.LINK_STORAGE_MIN_ENERGY;
    if (storageLink.energy < linkEnergyMax) {
        creep.state = 'filllink';
        return true;
    }
};

taskStock.prototype.stateTransferToMarket = function(creep) {
    if (!this.marketData[creep.room.name]) return;
    if (!this.marketData[creep.room.name].surplus) return;

    if (!_.isEmpty(this.marketData[creep.room.name].surplus)) {
        creep.state = 'surplustomarket';
        return true;
    }
};

taskStock.prototype.stateFillTerminal = function(creep) {
    let storage = creep.room.storage;
    let terminal = creep.room.terminal;
    if (!storage || !terminal) return;

    if (storage.store[RESOURCE_ENERGY] < C.MARKET_STORAGE_ENERGY_MIN) return;
    if (terminal.store[RESOURCE_ENERGY] < C.MARKET_STOCK_ENERGY) {
        creep.state = 'fillterminal';
        return true;
    }
};

taskStock.prototype.doSpawnDetails = function() {
    if (this.memory._sleepSpawnDetails && this.memory._sleepSpawnDetails > Game.time) return;
    this.memory._sleepSpawnDetails = Game.time + (C.TASK_SPAWN_DETAILS_SLEEP + Math.floor(Math.random() * 20));

    let workRoom = Game.rooms[this.memory.workRoom];
    if (!workRoom || !workRoom.storage ||
        !workRoom.controller || !workRoom.controller.my
    ) return;

    let limit = 0;
    if (_.filter(workRoom.getLinks(), structure =>
        structure.memory.type == 'storage').length > 0) {
        limit = 1;
    }

    let spawnDetail = {
        role: C.ROLE_STOCKER,
        priority: 49,
        spawnRoom: this.memory.spawnRoom,
        creepArgs: {},
        maxSize: 9999,
        minSize: 200,
        limit: limit,
    };

    this.setSpawnDetails(spawnDetail);
};

registerProcess(C.TASK_STOCK, taskStock);
