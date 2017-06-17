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

WorkQueue.prototype.printConfig = function(id) {
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return -1; }
    return Game.Manage.task.printConfig(this.queue[id]);
};

WorkQueue.prototype.getQueue = function() {
    return Game.Queue.getQueue({queue: C.QUEUE_WORK, });
};

WorkQueue.prototype.getWork = function(tasks, creep, args) {
    if (!Array.isArray(tasks)) { return ERR_INVALID_ARGS; }
    args = args || {};

    let queue = _.filter(this.getQueue(), record =>
        tasks.indexOf(record.task) >= 0 &&
        (!args.room || record.workRooms.indexOf(args.room) >= 0) &&
        record.creeps.indexOf(creep.name) == -1 &&
        record.creeps.length < record.creepLimit
    );

    let maxAge = Game.time - Math.min.apply(null, queue.tick);

    return _.sortBy(queue, record =>
        100 + record.priority -
        (100 * ((Game.time - record.tick) / maxAge))
    );
};

WorkQueue.prototype.addCreep = function(name, id) {
    if (!name) { return -1; }
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return -1; }
    if (!this.queue[id].creeps) { return -1; }
    if (this.queue[id].creeps.indexOf(name) >= 0) { return true; }

    this.queue[id].creeps.push(name);

    return true;
};

WorkQueue.prototype.removeCreep = function(name, id) {
    if (!name) { return -1; }
    if (isNaN(id)) { return -1; }
    if (!this.queue[id]) { return -1; }
    if (!this.queue[id].creeps) { return -1; }
    if (this.queue[id].creeps.indexOf(name) == -1) { return true; }

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
        (!args.targetId || record.targetId == args.targetId) &&
        ((!args.task || !args.room) ||
        (record.task == args.task && record.workRooms.indexOf(args.room) >= 0))
    ).length > 0 ? true : false;
};

WorkQueue.prototype.addRecord = function(args) {
    if (!args) { return -1; }
    if (!Array.isArray(args.workRooms)) { return -1; }
    if (C.WORK_TASKS.indexOf(args.task) < 0) { return -1; }
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

WorkQueue.prototype.delRecord = function(id) {
    return Game.Queue.delRecord(id);
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

WorkQueue.prototype.getRoomReport = function(room) {
    let output = '';
    let queue = this.getQueue();

    let filteredQueue = _.filter(queue, record =>
        (record.workRooms && record.workRooms.indexOf(room) >= 0) ||
        record.spawnRoom == room);

    output += '  Total Work Queue: ' + queue.length + '\n';
    output += '  Room Work Queue: ' + filteredQueue.length + '\n';

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

    return output;
};

module.exports = WorkQueue;
