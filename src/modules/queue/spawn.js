/*
 * spawn queue system
 *
 * queue for the spawning of creeps
 *
 */

var logger = new Logger('[Queue Spawn]');
logger.level = C.LOGLEVEL.INFO;

var SpawnQueue = function() {
    // init
};

SpawnQueue.prototype.getQueue = function() {
    return getQueue({queue: C.QUEUE_SPAWN, });
};

SpawnQueue.prototype.addRecord = function(args) {
    if (!args) { return ERR_INVALID_ARGS; }
    if (C.ROLE_TYPES.indexOf(args.role) < 0) { return ERR_INVALID_ARGS; }

    args.priority = args.priority || 100;
    args.rooms = args.rooms || [];

    let record = {
        queue: C.QUEUE_SPAWN,
        role: args.role,
        rooms: args.rooms,
        priority: args.priority,
    };

    if (args.minSize) record.minSize = args.minSize;
    if (args.creepArgs) record.creepArgs = args.creepArgs;

    logger.debug('adding record, role: ' + record.role + ', rooms: [' + record.rooms + '], priority: ' + record.priority);

    return addQueueRecord(record);
};

let spawnQueue = new SpawnQueue();

global.addQueueRecordSpawn = function(args) {
    return spawnQueue.addRecord(args);
};

global.getQueueSpawn = function() {
    return spawnQueue.getQueue();
};
