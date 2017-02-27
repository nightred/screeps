/*
 * queues system
 *
 * creates the base queue for all sub systems
 * The following use the primary queue as the base
 * spawn, work
 *
 */

var Queues = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;
};

Queues.prototype.getQueue = function(args) {
    args = args || {};

    return _.filter(this.queue, record =>
        (!args.queue || record.queue == args.queue)
        );
};

Queues.prototype.getId = function() {
    this.memory.queueID = this.memory.queueID || 0;
    this.memory.queueID = this.memory.queueID < 999999 ? this.memory.queueID : 0;

    let newId = this.memory.queueID;
    while (true) {
        newId++;
        if (!this.queue[newId]) { break; }
    }
    this.memory.queueID = newId;

    return newId;
};

Queues.prototype.delRecord = function(id) {
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return true; }

    delete this.queue[id];

    return true;
};

Queues.prototype.addRecord = function(args) {
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
    if (Constant.DEBUG >= 3) { console.log('VERBOSE - queue record added, id: ' + id); }

    return id;
};

module.exports = Queues;
