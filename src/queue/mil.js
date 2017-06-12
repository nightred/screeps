/*
 * Mil queue system
 *
 * queue for the managment of military tasks
 *
 */

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
    if (!squad) { return -1; }

    let queue = _.filter(this.getQueue(), record =>
        record.squad == squad);

    if (queue.length <= 0) { return false; }

    return queue[0];
};

MilQueue.prototype.isQueued = function(args) {
    if (!args) { return -1; }

    return _.filter(this.getQueue(), record =>
        (!args.squad || record.squad == args.squad)
    ).length > 0 ? true : false;
};

MilQueue.prototype.addRecord = function(args) {
    if (!args) { return -1; }
    if (!args.squad) { return -1; }
    args.priority = args.priority || 100;

    let record = {
        queue: C.QUEUE_MIL,
        squad: args.squad,
        priority: args.priority,
        creeps: [],
    };

    if (C.DEBUG >= 3) { console.log('VERBOSE - mil queue adding record, task: ' + record.task + ', priority: ' + record.priority); }
    return Game.Queue.addRecord(record);
};

MilQueue.prototype.delRecord = function(id) {
    return Game.Queue.delRecord(id);
};

module.exports = MilQueue;
