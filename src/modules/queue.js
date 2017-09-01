/*
 * queue system
 *
 * creates the base queue for all sub systems
 * The following use the primary queue as the base
 * spawn, work
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Queue]');
logger.level = C.LOGLEVEL.DEBUG;

require('modules.queue.spawn');
require('modules.queue.work');

var Queue = function() {
    Memory.world = Memory.world || {};

    if (!Memory.world.verQueue || Memory.world.verQueue != C.VERSION_QUEUE) {
        logger.warn('new version detected ' + C.VERSION_QUEUE +
        ' wiping queue');

        this.queue = {};
        Memory.world.verQueue = C.VERSION_QUEUE;
    }
};

Object.defineProperty(Kernel.prototype, 'queue', {
    get: function() {
        Memory.queue = Memory.queue || {};
        return this.memory.processTable;
    },
    set: function(value) {
        Memory.queue = Memory.queue || {};
        this.memory.processTable = value;
    },
});

Queue.prototype.onTick = function() {
    let cpuStart = Game.cpu.getUsed();

    onTickQueueSpawn();

    addTerminalLog(undefined, {
        command: 'queue cleanup',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
        output: 'record count: ' + _.size(this.queue),
    })
};

Queue.prototype.getQueue = function(args) {
    args = args || {};

    return _.filter(this.queue, record =>
        (!args.queue || record.queue == args.queue)
    );
};

Queue.prototype.getId = function() {
    let currentIDs _.sortBy(_.map(this.queue, r => r.id));

    let c = 0;

    for (let id of currentIDs) {
        c += 1;
        if (c !== id) return c;
    }

    return currentIDs.length;
};

Queue.prototype.delRecord = function(id) {
    if (!this.queue[id]) return;

    logger.debug('queue record removed id: ' + id);
    delete this.queue[id];
};

Queue.prototype.addRecord = function(args) {
    args = args || {};

    let id = this.getId();
    let record = {
        id: id,
        tick: Game.time,
    };
    for (let item in args) {
        record[item] = args[item];
    };

    this.queue[id] = record;
    logger.debug('queue record added id: ' + id);

    return id;
};

Queue.prototype.getRecord = function(id) {
    if (!this.queue[id]) return;
    return this.queue[id];
}

let queue = new Queue();

global.onTickQueue = function() {
    queue.onTick();
};

global.getQueue = function(args) {
    return queue.getQueue(args);
};

global.getQueueRecord = function(id) {
    return queue.getRecord(id);
};

global.addQueue = function(args) {
    return queue.addRecord(args);
};

global.delQueue = function(id) {
    queue.delRecord(id);
};
