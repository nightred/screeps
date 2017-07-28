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

WorkQueue.prototype.getQueue = function() {
    return Game.Queue.getQueue({queue: C.QUEUE_WORK, });
};

WorkQueue.prototype.isQueued = function(args) {
    if (!args) { return ERR_INVALID_ARGS; }

    return _.filter(this.getQueue(), record =>
        (!args.targetId || record.targetId == args.targetId) &&
        ((!args.task || !args.room) ||
        (record.task == args.task && record.workRooms.indexOf(args.room) >= 0))
    ).length > 0 ? true : false;
};

WorkQueue.prototype.addRecord = function(args) {
    if (!args) { return ERR_INVALID_ARGS; }
    if (!Array.isArray(args.workRooms)) { return ERR_INVALID_ARGS; }
    if (C.WORK_TYPES.indexOf(args.task) < 0) { return ERR_INVALID_ARGS; }

    args.priority = args.priority || 100;
    args.creepLimit = args.creepLimit || 0;

    let record = {
        queue: C.QUEUE_WORK,
        task: args.task,
        workRooms: args.workRooms,
        priority: args.priority,
        creeps: [],
        creepLimit: args.creepLimit,
    };

    if (args.targetId) { record.targetId = args.targetId; }
    if (args.message) { record.message = args.message; }
    if (args.spawnRoom) { record.spawnRoom = args.spawnRoom; }
    if (args.managed) { record.managed = args.managed; }

    if (C.DEBUG >= 3) { console.log('VERBOSE - work queue adding record, task: ' + record.task + ', priority: ' + record.priority); }
    return Game.Queue.addRecord(record);
};

WorkQueue.prototype.cleanRoomQueue = function(roomName) {
    if (!roomName) { return -1 };

    let records = _.filter(this.getQueue(), record =>
        record.workRooms.indexOf(roomName) >= 0
    );

    if (records.length <= 0) { return true; }

    for(let i = 0; i < records.length; i++) {
        if (C.DEBUG >= 3) { console.log('VERBOSE - work queue removing record, id: ' + records[i].id + ', task: ' + records[i].task); }
        this.delRecord(records[i].id);
    }

    return true;
};

module.exports = WorkQueue;
