/*
 * Loader
 */

var logger = new Logger('[Loader]');

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

Object.defineProperty(Loader.prototype, 'serviceSpawn', {
    get: function() {
        if (!this.memory._serviceSpawnPid) return false;
        return Game.kernel.getProcessByPid(this.memory._serviceSpawnPid);
    },
    set: function(value) {
        this.memory._serviceSpawnPid = value.pid;
    },
});

Loader.prototype.run = function() {
    // check default services have been started
    if (!this.serviceFlag) {
        let process = Game.kernel.startProcess(this, 'services/flag', {});
        Game.kernel.setParent(process.pid);
        this.serviceFlag = process;
    }

    if (!this.serviceRoom) {
        let process = Game.kernel.startProcess(this, 'services/room', {});
        Game.kernel.setParent(process.pid);
        this.serviceRoom = process;
    }

    if (!this.serviceCreep) {
        let process = Game.kernel.startProcess(this, 'services/creep', {});
        Game.kernel.setParent(process.pid);
        this.serviceCreep = process;
    }

    if (!this.serviceMarket) {
        let process = Game.kernel.startProcess(this, 'services/market', {});
        Game.kernel.setParent(process.pid);
        this.serviceMarket = process;
    }

    if (!this.serviceSpawn) {
        let process = Game.kernel.startProcess(this, C.SERVICES_SPAWN, {});
        Game.kernel.setParent(process.pid);
        this.serviceSpawn = process;
    }
};

registerProcess('loader/init', Loader);
