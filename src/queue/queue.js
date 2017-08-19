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
logger.level = C.LOGLEVEL.INFO;

 var SpawnQueue      = require('queue.spawn');
 var WorkQueue       = require('queue.work');
 var MilQueue       = require('queue.mil');

var Queue = function() {
    if (!Memory.queues) {
        Memory.queues = {};
    }

    if (!Memory.queues.queue) {
        Memory.queues.queue = {};
    }

    if (!Memory.queues.ver || Memory.queues.ver != C.VERSION_QUEUE) {
        logger.warn('new version detected ' + C.VERSION_QUEUE +
        ' previous version ' + Memory.queues.ver +
        ' wiping queue');

        Memory.queues = {};
        Memory.queues.queue = {};
        Memory.queues.ver = C.VERSION_QUEUE;
    }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;

    this.spawn  = new SpawnQueue;
    this.work   = new WorkQueue;
    this.mil    = new MilQueue;
};

Queue.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    this.spawn.gc();

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
    this.memory.queueID = this.memory.queueID || 0;
    this.memory.queueID = this.memory.queueID < 99999 ? this.memory.queueID : 0;

    let newId = this.memory.queueID;
    while (true) {
        newId++;
        if (!this.queue[newId]) { break; }
    }
    this.memory.queueID = newId;

    return newId;
};

Queue.prototype.delRecord = function(id) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }
    if (!this.queue[id]) { return true; }

    logger.debug('queue record removed:\n' + this.print(id));
    delete this.queue[id];

    return true;
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
    logger.debug('queue record added:\n' + this.print(id));

    return id;
};

Queue.prototype.getRecord = function(id) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }

    if (!this.queue[id]) {
        return false;
    }

    return this.queue[id];
}

Queue.prototype.print = function(id) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }
    if (!this.queue[id]) {
        console.log('queue record id: ' + id + ', does not exist');
        return false;
    }

    let record = this.queue[id];
    let output = '{';
    for (let item in record) {
        output += item + ': ';
        if (Array.isArray(record[item])) {
            output += '['+ record[item] + ']';
        } else {
            output += record[item]
        }
        output += ', ';
    };
    output += '}';

    return output;
}

module.exports = Queue;
