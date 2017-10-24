/*
 * spawn queue system
 *
 * queue for the spawning of creeps
 *
 */

var logger = new Logger('[Queue Spawn]');

var SpawnQueue = function() {
    // init
};

SpawnQueue.prototype.getQueue = function() {
    return getQueue({queue: C.QUEUE_SPAWN, });
};

SpawnQueue.prototype.addRecord = function(args) {
    if (!args) return ERR_INVALID_ARGS;
    if (C.ROLE_TYPES.indexOf(args.role) < 0) return ERR_INVALID_ARGS;
    _.defaults(args, {
        priority: 100,
        creepArgs: {},
    });
    logger.debug('adding record, role: ' + args.role +
        ', room: ' + args.room +
        ', priority: ' + args.priority
    );
    return addQueueRecord({
        queue: C.QUEUE_SPAWN,
        role: args.role,
        room: args.room,
        priority: args.priority,
        creepArgs: args.creepArgs,
    });
};

let spawnQueue = new SpawnQueue();

global.addQueueRecordSpawn = function(args) {
    return spawnQueue.addRecord(args);
};

global.getQueueSpawn = function() {
    return spawnQueue.getQueue();
};
