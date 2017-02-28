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

    this.tasks = {};
    for (let i = 0; i < Constant.WORK_TASKS.length; i++) {
        this.tasks[Constant.WORK_TASKS[i]] = this.getTask(Constant.WORK_TASKS[i]);
    }

};

WorkQueue.prototype.doTask = function(creep) {
    if (!creep) { return -1; }

    if (!this.queue[creep.memory.workId]) { return false; }
    let work = this.queue[creep.memory.workId];

    return this.tasks[work.task].doTask(creep, work);
}

WorkQueue.prototype.getTask = function(task) {
    if (Constant.WORK_TASKS.indexof(task) < 0) {
        if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load work task: ' + task); }
        return -1;
    }

    let task = false;
    try {
        task = require('task.' + task);
    } catch(e) {
        if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load work task: ' + task + ', error:\n' + e); }
    }

    return task;
};

WorkQueue.prototype.doManageTasks = function() {
    let taskList = _.sortBy(_.filter(this.getQueue(), task =>
        task.managed
    ), task => task.priority);
    if (!taskList || taskList.length < 0) { return false; }

    for (let i =0; i < taskList.length; i++) {
        this.tasks[taskList[i].task].doManage(taskList[i]);
    }

    return true;
};

WorkQueue.prototype.doTaskFind = function(room) {
    if (!room) { return -1; }

    for (let task in this.tasks) {
        this.tasks[task].doTaskFind(room);
    }

    return true;
};

WorkQueue.prototype.getQueue = function() {
    return Game.Queues.getQueue({queue: Constant.QUEUE_WORK, });
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
    if (!this.queue[id]) { return -1; }
    if (!this.queue[id].creeps) { return -1; }

    this.queue[id].creeps.push(name);

    return true;
};

WorkQueue.prototype.removeCreep = function(name, id) {
    if (!name) { return -1; }
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return -1; }
    if (!this.queue[id].creeps) { return -1; }

    let record = this.queue[id];
    for (let i = 0; i < record.creeps.length; i++) {
        if (record.creeps[i] == name) {
            record.creeps.splice(i, 1);
            break;
        }
    }

    return true;
};

WorkQueue.prototype.isQueued = function(args) {
    if (!args) { return -1; }

    return _.filter(this.getQueue(), record =>
        (!args.targetId || record.targetId == args.targetId)
    ).length > 0 ? true : false;
};

WorkQueue.prototype.addRecord(args) {
    if (!args) { return -1; }
    if (!Array.isArray(args.rooms)) { return -1; }
    if (Constant.WORK_TASKS.indexof(args.task) < 0) { return -1; }
    args.priority = args.priority || 100;
    args.creepLimit = args.creepLimit || 1;

    let record = {
        queue: Constant.QUEUE_WORK,
        task: args.task,
        rooms: args.rooms,
        priority: args.priority,
        creeps: [],
        creepLimit: args.creepLimit,
    };
    if (args.targetId) { record.targetId = args.targetId; }
    if (args.message) { record.message = args.message; }
    if (args.creepLimit) { record.creepLimit = args.creepLimit; }

    if (Constant.DEBUG >= 3) { console.log('VERBOSE - work queue adding record, task: ' + record.task + ', room: [' + record.rooms + '], priority: ' + record.priority); }
    return Game.Queues.addRecord(record);
};

WorkQueue.prototype.delRecord = function(id) {
    return Game.Queues.delRecord(id);
};

module.exports = WorkQueue;
