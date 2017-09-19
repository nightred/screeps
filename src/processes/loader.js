/*
 * Loader
 */

var logger = new Logger('[Loader]');
logger.level = C.LOGLEVEL.DEBUG;

var Loader = function() {
    // init
};

Object.defineProperty(Loader.prototype, 'serviceFlag', {
    get: function() {
        if (!this.memory.serviceFlagPid) return false;
        return Game.kernel.getProcessByPid(this.memory.serviceFlagPid);
    },
    set: function(value) {
        this.memory.serviceFlagPid = value.pid;
    },
});

Object.defineProperty(Loader.prototype, 'serviceRoom', {
    get: function() {
        if (!this.memory.serviceRoomPid) return false;
        return Game.kernel.getProcessByPid(this.memory.serviceRoomPid);
    },
    set: function(value) {
        this.memory.serviceRoomPid = value.pid;
    },
});

Object.defineProperty(Loader.prototype, 'serviceCreep', {
    get: function() {
        if (!this.memory.serviceCreepPid) return false;
        return Game.kernel.getProcessByPid(this.memory.serviceCreepPid);
    },
    set: function(value) {
        this.memory.serviceCreepPid = value.pid;
    },
});

Object.defineProperty(Loader.prototype, 'serviceMarket', {
    get: function() {
        if (!this.memory.serviceMarketPid) return false;
        return Game.kernel.getProcessByPid(this.memory.serviceMarketPid);
    },
    set: function(value) {
        this.memory.serviceMarketPid = value.pid;
    },
});

Loader.prototype.run = function() {
    // check default services have been started
    if (!this.serviceFlag) {
        this.serviceFlag = Game.kernel.startProcess(this, 'services/flag', {});
    }

    if (!this.serviceRoom) {
        this.serviceRoom = Game.kernel.startProcess(this, 'services/room', {});
    }

    if (!this.serviceCreep) {
        this.serviceCreep = Game.kernel.startProcess(this, 'services/creep', {});
    }

    if (!this.serviceMarket) {
        this.serviceMarket = Game.kernel.startProcess(this, 'services/market', {});
    }
};

registerProcess('loader/init', Loader);
