/*
 * Mil queue system
 *
 * queue for the managment of military tasks
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Queue Mil]');
logger.level = C.LOGLEVEL.INFO;

var MilQueue = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;
};

MilQueue.prototype.getQueue = function() {
    return Game.Queue.getQueue({queue: C.QUEUE_MIL, });
};

MilQueue.prototype.getSquad = function(squad) {
    if (!squad) { return ERR_INVALID_ARGS; }

    let queue = _.filter(this.getQueue(), record =>
        record.squad == squad);

    if (queue.length <= 0) { return false; }

    return queue[0];
};

MilQueue.prototype.isQueued = function(args) {
    if (!args) { return ERR_INVALID_ARGS; }

    return _.filter(this.getQueue(), record =>
        (!args.squad || record.squad == args.squad)
    ).length > 0 ? true : false;
};

MilQueue.prototype.addRecord = function(args) {
    if (!args) { return ERR_INVALID_ARGS; }
    if (!args.squad) { return ERR_INVALID_ARGS; }
    args.priority = args.priority || 100;

    let record = {
        queue: C.QUEUE_MIL,
        squad: args.squad,
        priority: args.priority,
        creeps: [],
    };

    logger.debug('adding record, task: ' + record.task + ', priority: ' + record.priority);
    return Game.Queue.addRecord(record);
};

MilQueue.prototype.delRecord = function(id) {
    return Game.Queue.delRecord(id);
};

module.exports = MilQueue;
