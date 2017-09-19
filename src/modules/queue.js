/*
 * queue system
 *
 * creates the base queue for all sub systems
 * The following use the primary queue as the base
 * spawn, work
 *
 */

var logger = new Logger('[Queue]');
logger.level = C.LOGLEVEL.INFO;

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

Object.defineProperty(Queue.prototype, 'queue', {
    get: function() {
        Memory.queue = Memory.queue || {};
        return Memory.queue;
    },
    set: function(value) {
        Memory.queue = Memory.queue || {};
        Memory.queue = value;
    },
});

Queue.prototype.getQueue = function(args) {
    args = args || {};

    return _.filter(this.queue, record =>
        (!args.queue || record.queue == args.queue)
    );
};

Queue.prototype.delRecord = function(id) {
    if (!this.queue[id]) return;

    logger.debug('queue record removed id: ' + id);
    delete this.queue[id];
};

Queue.prototype.addRecord = function(args) {
    args = args || {};

    let id = getId();
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
    return this.queue[id];
}

var getId = function() {
    return 'Q_' + Math.random().toString(32).slice(2) + Game.time.toString(32);;
};

let queue = new Queue();

global.getQueue = function(args) {
    return queue.getQueue(args);
};

global.getQueueRecord = function(id) {
    return queue.getRecord(id);
};

global.addQueueRecord = function(args) {
    return queue.addRecord(args);
};

global.delQueueRecord = function(id) {
    queue.delRecord(id);
};
