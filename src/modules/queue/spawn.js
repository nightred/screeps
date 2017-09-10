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

SpawnQueue.prototype.cleanup = function() {
    let records = _.filter(this.getQueue(), record =>
        record.spawned
    );

    if (records.length <= 0) {
        return true;
    }

    for(let i = 0; i < records.length; i++) {


        if ((records[i].spawnedTime + C.SPAWN_QUEUE_DELAY) < Game.time) {
            logger.debug('removing record, id: ' + records[i].id + ', role: ' + records[i].role + ', name: ' + records[i].name + ', spawned');

            delQueueRecord(records[i].id);
        }
    }
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
