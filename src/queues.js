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

    if (C.DEBUG >= 3) { console.log('VERBOSE - queue record removed:\n' + this.getRecord(id)); }
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
    if (C.DEBUG >= 3) { console.log('VERBOSE - queue record added:\n' + this.getRecord(id)); }

    return id;
};

Queues.prototype.getRecord = function(id) {
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

Queues.prototype.getReport = function() {
    let output = '';
    let queue = this.getQueue();

    let filteredQueue = _.filter(queue, record => record.queue == C.QUEUE_WORK);
    output += '  Queue ' + C.QUEUE_WORK + ': ' + filteredQueue.length + '\n';
    for (let t = 0; t < C.WORK_TASKS.length; t++) {
        let records = _.filter(filteredQueue, record => record.task == C.WORK_TASKS[t]);
        if (records.length > 0) {
            output += '    ' + C.WORK_TASKS[t] + ': ' + records.length + '\n';
            output += '      [ ';
            for (let i = 0; i < records.length; i++) {
                output += records[i].id;
                if ((i + 1) % 8 == 0 && i != records.length - 1) {
                    output += ',\n        ';
                } else if (i < records.length - 1) {
                    output += ', ';
                }
            }
            output += ' ]\n';
        }
    }

    filteredQueue = _.filter(queue, record => record.queue == C.QUEUE_SPAWN);
    output += '  Queue ' + C.QUEUE_SPAWN + ': ' + filteredQueue.length + '\n';
    for (let r = 0; r < C.ROLE_TYPES.length; r++) {
        let records = _.filter(filteredQueue, record => record.role == C.ROLE_TYPES[r]);
        if (records.length > 0) {
            output += '    ' + C.ROLE_TYPES[r] + ': ' + records.length + '\n';
            output += '      [ ';
            for (let i = 0; i < records.length; i++) {
                output += records[i].id;
                if ((i + 1) % 8 == 0 && i != records.length - 1) {
                    output += ',\n        ';
                } else if (i < records.length - 1) {
                    output += ', ';
                }
            }
            output += ' ]\n';
        }
    }

    return output;
}

module.exports = Queues;
