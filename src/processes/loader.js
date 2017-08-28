/*
 * Loader
 */

var Logger = require('util.logger');

var logger = new Logger('[Loader]');
logger.level = C.LOGLEVEL.DEBUG;

var Loader = function() {
    // init
};

Object.defineProperty(Kernel.prototype, 'serviceFlag', {
    get: function() {
        if (!this.memory.serviceFlagPid) return false;
        return Game.kernel.getProcessByPid(this.memory.serviceFlagPid);
    },
    set: function(value) {
        this.memory.serviceFlagPid = value.pid;
    },
});

Object.defineProperty(Kernel.prototype, 'serviceRoom', {
    get: function() {
        if (!this.memory.serviceRoomPid) return false;
        return Game.kernel.getProcessByPid(this.memory.serviceRoomPid);
    },
    set: function(value) {
        this.memory.serviceRoomPid = value.pid;
    },
});

Loader.prototype.run = function() {
    // check default services
    if (!this.serviceFlag) {
        this.serviceFlag = Game.kernel.startProcess(this, 'services/flag', {});
    }

    if (!this.serviceRoom) {
        this.serviceRoom = Game.kernel.startProcess(this, 'services/room', {});
    }
};

registerProcess('loader/init', Loader);
