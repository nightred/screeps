/*
 * work queue system
 *
 * queue for the managment of work tasks
 *
 */

var WorkQueue = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;
};

WorkQueue.prototype.doManageTasks = function() {
    // todo
};

WorkQueue.prototype.doTaskFind = function() {
    // todo
};

WorkQueue.prototype.getQueue = function() {
    return Game.Queues.getQueue({queue: 'work'});
};

WorkQueue.prototype.getWork = function(tasks, args) {
    if (!Array.isArray(tasks)) { return -1; }
    args = args | {};

    return _sortBy(_.filter(this.getQueue(), record =>
        tasks.indexOf(record.task) >= 0 &&
        (!args.room || record.rooms.indexOf(args.room) >= 0) &&
        record.creeps.length < record.creepLimit
    ), record => record.priority);
};

WorkQueue.prototype.addCreep = function(name, id) {
    if (!name) { return -1; }
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return false; }
    if (!this.queue[id].creeps) { return false; }

    this.queue[id].creeps.push(name);

    return true;
};

WorkQueue.prototype.isQueued = function(args) {
    if (!args) { return -1; }

    return _.filter(this.getQueue(), record =>
        (!args.targetId || record.targetId = args.targetId)
    ).length > 0 ? true : false;
}

WorkQueue.prototype.addRecord(args) {
    if (!args) { return -1; }
    if (!Array.isArray(args.rooms)) { return -1; }
    if (Constant.WORK_TASKS.indexof(args.task) < 0) { return -1; }
    args.priority = args.priority || 100;
    args.creepLimit = args.creepLimit || 1;

    let record = {
        task: args.task,
        rooms: args.rooms,
        priority: args.priority,
        creeps: [],
        creepLimit: args.creepLimit,
    };
    if (args.targetId) { record.targetId = args.targetId; }
    if (args.message) { record.message = args.message; }
    if (args.creepLimit) { record.creepLimit = args.creepLimit; }

    if (Constant.DEBUG >= 3) { console.log('VERBOSE - work queue adding record task: ' + record.task + ', room: ' + queueItem.room + ', priority: ' + record.priority); }
    return Game.Queues.addRecord(record);
}

module.exports = WorkQueue;
