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

    this.roles = {};
    for (let i =0; i < Constant.ROLE_TYPES.length; i++) {
        this.roles[Constant.ROLE_TYPES[i]] = this.getRole(Constant.ROLE_TYPES[i]);
    }

    this.cleanQueue();
};

SpawnQueue.prototype.getRole = function(name) {
    if (Constant.ROLE_TYPES.indexOf(name) < 0) {
        if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name); }
        return -1;
    }

    let role = false;
    try {
        role = require('role.' + name);
    } catch(e) {
        if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name + ', error:\n' + e); }
    }

    return role;
};

SpawnQueue.prototype.cleanQueue = function() {
    let records = _.filter(this.getQueue(), record =>
        record.spawned
    );
    if (records.length <= 0) { return true; }

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
        if ((records[i].spawnedTime + Constant.SPAWN_QUEUE_DELAY) < Game.time) {
            if (Constant.DEBUG >= 3) { console.log('VERBOSE - spawn queue removing record, id: ' + records[i].id + ', role: ' + records[i].role + ', name: ' + records[i].name + ', spawned'); }
            this.delRecord(records[i].id);
        }
    }
};

SpawnQueue.prototype.doSpawn = function(room) {
    if (!room) { return -1; }

    let energy = room.energyAvailable;
    if (energy < Constant.ENERGY_CREEP_SPAWN_MIN) { return true; }

    let records = _.filter(this.getQueue(), record =>
        record.rooms.indexOf(room.name) >= 0 &&
        !record.spawned
    );
    if (records.length <= 0) { return true; }
    records = _.sortBy(records, record => record.priority);

    let spawns = room.getSpawns();
    if (spawns.length <= 0) { return true; }

    for (let s = 0; s < spawns.length; s++) {
        if (spawns[s].spawning) { continue; }
        for (let r = 0; r < records.length; r++) {
            if (records[r].spawned) { continue; }
            if (records[r].minSize && energy < records[r].minSize) { continue; }

            let args = {};
            args.spawnRoom = room.name;
            if (records[r].creepArgs) {
                for (let item in records[r].creepArgs) {
                    args[item] = records[r].creepArgs[item];
                };
            }

            let body = this.roles[records[r].role].getBody(energy, args);
            let name = this.roles[records[r].role].doSpawn(spawns[s], body, args);
            if (name != undefined && !(name < 0)) {
                energy -= this.getBodyCost(body);
                records[r].spawned = true;
                records[r].name = name;
                if (Constant.DEBUG >= 1) { console.log('INFO - spawning name: ' + name + ', role: ' + records[r].role + ', parts:  ' + Game.creeps[name].body.length + ', room:' + room.name); }
                break;
            }
        }
        if (energy < Constant.ENERGY_CREEP_SPAWN_MIN) { break; }
    }

    return true;
};

SpawnQueue.prototype.getBodyCost = function(body) {
    if (!Array.isArray(body)) { return -1; }

    let cost = 0;
    for (let i = 0; i < body.length; i++) {
        cost += BODYPART_COST[body[i]];
    }

    return cost;
};

SpawnQueue.prototype.getQueue = function() {
    return Game.Queues.getQueue({queue: Constant.QUEUE_SPAWN, });
};

SpawnQueue.prototype.isQueued = function(args) {
    if (!args) { return -1; }

    return _.filter(this.getQueue(), record =>
        (!args.role || record.role == args.role) &&
        (!args.room || record.rooms.indexOf(args.room) >= 0)
    ).length > 0 ? true : false;
};

SpawnQueue.prototype.addRecord = function(args) {
    if (!args) { return -1; }
    if (!Array.isArray(args.rooms)) { return -1; }
    if (Constant.ROLE_TYPES.indexOf(args.role) < 0) { return -1; }
    args.priority = args.priority || 100;

    let record = {
        queue: Constant.QUEUE_SPAWN,
        role: args.role,
        rooms: args.rooms,
        priority: args.priority,
    };
    if (args.minSize) { record.minSize = args.minSize; }
    if (args.creepArgs) { record.creepArgs = args.creepArgs; }

    if (Constant.DEBUG >= 3) { console.log('VERBOSE - spawn queue adding record, role: ' + record.role + ', rooms: [' + record.rooms + '], priority: ' + record.priority); }
    return Game.Queues.addRecord(record);
};

SpawnQueue.prototype.delRecord = function(id) {
    return Game.Queues.delRecord(id);
}

module.exports = SpawnQueue;
