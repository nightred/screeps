/*
 * queue system
 *
 * creates the base queue for all sub systems
 * The following use the primary queue as the base
 * spawn, work
 *
 */

 var SpawnQueue      = require('queue.spawn');
 var WorkQueue       = require('queue.work');
 var MilQueue       = require('queue.mil');

var Queue = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;

    this.spawn  = new SpawnQueue;
    this.work   = new WorkQueue;
    this.mil    = new MilQueue;
};

Queue.prototype.run = function() {
    this.spawn.cleanQueue();
    this.work.doManageTasks();
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
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return true; }

    if (C.DEBUG >= 3) { console.log('VERBOSE - queue record removed:\n' + this.getRecord(id)); }
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
    if (C.DEBUG >= 3) { console.log('VERBOSE - queue record added:\n' + this.getRecord(id)); }

    return id;
};

Queue.prototype.getRecord = function(id) {
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return false; }
    return this.queue[id];
}

Queue.prototype.print = function(id) {
    if (isNaN(id)) { return -1; }
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

Queue.prototype.getRoomReport = function(room) {
    let output = '';

    output += this.work.getRoomReport(room);
    output += this.spawn.getRoomReport(room);

    return output;
}

module.exports = Queue;
