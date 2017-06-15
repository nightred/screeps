/*
 * spawn queue system
 *
 * queue for the spawning of creeps
 *
 */

var SpawnQueue = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;
};

SpawnQueue.prototype.cleanQueue = function() {
    let records = _.filter(this.getQueue(), record =>
        record.spawned
    );

    if (records.length <= 0) {
        return true;
    }

    for(let i = 0; i < records.length; i++) {
        if (!Game.creeps[records[i].name]) {
            records[i].spawnedTime = records[i].spawnedTime || Game.time;
        }

        if (Game.creeps[records[i].name] && Game.creeps[records[i].name].spawning && records[i].spawnedTime) {
            delete records[i].spawnedTime;
        }

        if (Game.creeps[records[i].name] && !Game.creeps[records[i].name].spawning) {
            records[i].spawnedTime = records[i].spawnedTime || Game.time;
        }

        if ((records[i].spawnedTime + C.SPAWN_QUEUE_DELAY) < Game.time) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - spawn queue removing record, id: ' + records[i].id + ', role: ' + records[i].role + ', name: ' + records[i].name + ', spawned'); }
            this.delRecord(records[i].id);
        }
    }
};

SpawnQueue.prototype.cleanRoomQueue = function(roomName) {
    if (!roomName) { return -1 };

    let records = _.filter(this.getQueue(), record =>
        record.rooms.indexOf(roomName) >= 0
    );

    if (records.length <= 0) {
        return true;
    }

    for(let i = 0; i < records.length; i++) {
        if (C.DEBUG >= 3) { console.log('VERBOSE - spawn queue removing record, id: ' + records[i].id + ', role: ' + records[i].role + ', name: ' + records[i].name + ', spawned'); }
        this.delRecord(records[i].id);
    }

    return true;
};

SpawnQueue.prototype.getQueue = function() {
    return Game.Queue.getQueue({queue: C.QUEUE_SPAWN, });
};

SpawnQueue.prototype.isQueued = function(args) {
    if (!args) { return -1; }

    return _.filter(this.getQueue(), record =>
        (!args.role || record.role == args.role) &&
        (!args.workId || (record.creepArgs && record.creepArgs.workId == args.workId)) &&
        (!args.directorId || (record.creepArgs && record.creepArgs.directorId == args.directorId)) &&
        (!args.room || record.rooms.indexOf(args.room) >= 0)
    ).length > 0 ? true : false;
};

SpawnQueue.prototype.addRecord = function(args) {
    if (!args) { return -1; }
    if (C.ROLE_TYPES.indexOf(args.role) < 0) { return -1; }
    args.priority = args.priority || 100;
    args.rooms = args.rooms || [];

    let record = {
        queue: C.QUEUE_SPAWN,
        role: args.role,
        rooms: args.rooms,
        priority: args.priority,
    };

    if (args.minSize) { record.minSize = args.minSize; }
    if (args.creepArgs) { record.creepArgs = args.creepArgs; }

    if (C.DEBUG >= 3) { console.log('VERBOSE - spawn queue adding record, role: ' + record.role + ', rooms: [' + record.rooms + '], priority: ' + record.priority); }
    
    return Game.Queue.addRecord(record);
};

SpawnQueue.prototype.delRecord = function(id) {
    return Game.Queue.delRecord(id);
};

SpawnQueue.prototype.getRoomReport = function(room) {
    let output = '';
    let queue = this.getQueue();

    let filteredQueue = _.filter(queue, record => record.rooms.indexOf(room) >= 0);
    output += '  Total Spawn Queue: ' + queue.length + '\n';
    output += '  Room Spawn Queue : ' + filteredQueue.length + '\n';
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
};

module.exports = SpawnQueue;
