/*
 * task Stock
 *
 * stock manages the filling of links and structures
 *
 */

var taskStock = function() {
    // init
};

_.extend(taskStock.prototype, require('lib.cachelinks'));

Object.defineProperty(taskStock.prototype, 'state', {
    get: function() {
        this.memory.state = this.memory.state || 'init';
        return this.memory.state;
    },
    set: function(value) {
        this.memory.state = value;
    },
});

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
    let creep = Game.creeps[this.memory.creepName];
    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) return;
    if (creep.isSleep()) return;

    this.manageState(creep);
    if (this.state == 'wait') {
        creep.sleep();
    } else if (this.state == 'filllink') {
        this.doFillLink(creep);
    } else if (this.state == 'emptylink') {
        this.doEmptyLink(creep);
    } else if (this.state == 'storestorage' || this.state == 'store') {
        this.doStoreStorage(creep);
    } else if (this.state == 'surplustomarket') {
        this.doSurplusToMarket(creep);
    } else if (this.state == 'storeterminal') {
        this.doStoreTerminal(creep);
    } else if (this.state == 'fillterminal') {
        this.doFillTerminal(creep);
    }
};

taskStock.prototype.doFillLink = function(creep) {
    let storage = creep.room.storage;
    if (!storage) return;

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
        this.state = 'emptylink';
        return;
    }

    creep.doTransfer(storageLink, RESOURCE_ENERGY);
    this.state = 'wait';
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
    this.state = 'storestorage';
};

taskStock.prototype.doStoreStorage = function(creep) {
    if (!creep.isEmpty()) {
        let storage = creep.room.storage;
        if (!storage) return;

        creep.doTransfer(storage);
        return;
    }

    this.state = 'wait';
};

taskStock.prototype.doStoreTerminal = function(creep) {
    if (!creep.isEmpty()) {
        let terminal = creep.room.terminal;
        if (!terminal) return;

        creep.doTransfer(terminal);
        return;
    }

    this.state = 'wait';
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

    this.state = 'storeterminal';
};

taskStock.prototype.doFillTerminal = function(creep) {
    let storage = creep.room.storage;
    if (!storage) return;

    creep.doWithdraw(storage, RESOURCE_ENERGY);

    this.state = 'storeterminal';
};

// check the state of the stocker
taskStock.prototype.manageState = function(creep) {
    if (this.state == 'init') this.state = 'wait';

    if (this.state == 'wait') {
        if (this.stateEmptyLink(creep)) return;
        if (this.stateFillLink(creep)) return;
        if (this.stateTransferToMarket(creep)) return;
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
        this.state = 'emptylink';
        return true;
    }
};

taskStock.prototype.stateFillLink = function(creep) {
    if (!creep.room.storage) return;

    let linksStorage = this.getRoomLinksStorage(creep.room);
    if (linksStorage.length === 0) return;

    let storageLink = Game.getObjectById(linksStorage[0]);
    if (!storageLink) return;

    let linkEnergyMax = storageLink.energyCapacity * C.LINK_STORAGE_MIN_ENERGY;
    if (storageLink.energy < linkEnergyMax) {
        this.state = 'filllink';
        return true;
    }
};

taskStock.prototype.stateTransferToMarket = function(creep) {
    if (!this.marketData[creep.room.name]) return;
    if (!this.marketData[creep.room.name].surplus) return;

    if (!_.isEmpty(this.marketData[creep.room.name].surplus)) {
        this.state = 'surplustomarket';
        return true;
    }
};

taskStock.prototype.stateFillTerminal = function(creep) {
    let storage = creep.room.storage;
    let terminal = creep.room.terminal;
    if (!storage || !terminal) return;

    if (storage.store[RESOURCE_ENERGY] < C.MARKET_STORAGE_ENERGY_MIN) return;
    if (terminal.store[RESOURCE_ENERGY] < C.MARKET_STOCK_ENERGY) {
        this.state = 'fillterminal';
        return true;
    }
};

registerProcess('tasks/stock', taskStock);
