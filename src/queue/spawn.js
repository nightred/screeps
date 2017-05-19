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
        if ((records[i].spawnedTime + C.SPAWN_QUEUE_DELAY) < Game.time) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - spawn queue removing record, id: ' + records[i].id + ', role: ' + records[i].role + ', name: ' + records[i].name + ', spawned'); }
            this.delRecord(records[i].id);
        }
    }
};

SpawnQueue.prototype.doSpawn = function(room) {
    if (!room) { return -1; }

    let energy = room.energyAvailable;
    let maxEnergy = room.energyCapacityAvailable * C.SPAWN_ENERGY_MAX;
    if (energy < C.ENERGY_CREEP_SPAWN_MIN) { return true; }
    let records = _.filter(this.getQueue(), record =>
        (record.rooms.indexOf(room.name) >= 0 ||
        record.rooms.length == 0) &&
        !record.spawned
    );
    if (records.length <= 0) { return true; }
    records = _.sortBy(_.sortBy(
        records, record => record.tick
    ), record => record.priority);

    let spawns = room.getSpawns();
    if (spawns.length <= 0) { return true; }

    for (let s = 0; s < spawns.length; s++) {
        if (spawns[s].spawning) { continue; }
        for (let r = 0; r < records.length; r++) {
            if (records[r].spawned) { continue; }
            let spawnEnergy = energy > maxEnergy ? maxEnergy : energy;
            if (records[r].minSize && spawnEnergy < records[r].minSize) { continue; }

            let minSize = 0;
            if (Game.time < (records[r].tick + C.SPAWN_COST_DECAY)) {
                minSize = (maxEnergy - C.ENERGY_CREEP_SPAWN_MIN) - ((maxEnergy / C.SPAWN_COST_DECAY) * (Game.time - records[r].tick));
                minSize = minSize >= 0 ? minSize : 0;
            }
            minSize += C.ENERGY_CREEP_SPAWN_MIN;
            if (minSize > spawnEnergy) { continue; }

            if (records[r].maxSize && spawnEnergy > records[r].maxSize) {
                spawnEnergy = records[r].maxSize;
            }

            let args = {};
            args.spawnRoom = room.name;
            if (records[r].creepArgs) {
                for (let item in records[r].creepArgs) {
                    args[item] = records[r].creepArgs[item];
                };
            }

            let body = Game.Manage.role.getBody(records[r].role, spawnEnergy, args);
            if (this.getBodyCost(body) > energy) { continue; }
            let name = Game.Manage.role.doSpawn(records[r].role, spawns[s], body, args);
            if (name != undefined && !(name < 0)) {
                energy -= this.getBodyCost(body);
                records[r].spawned = true;
                records[r].name = name;
                if (C.DEBUG >= 1) { console.log('INFO - spawning' +
                ' room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>' +
                ', role: ' + records[r].role +
                ', parts: ' + Game.creeps[name].body.length +
                ', name: ' + name); }
                break;
            }
        }
        if (energy < C.ENERGY_CREEP_SPAWN_MIN) { break; }
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

SpawnQueue.prototype.getCreepName = function(role) {
    let name = role.replace(/\./g, '_');
    name += '_' + Math.random().toString(36).substr(2, 1);
    name += '_' + Game.time % 1000;

    return name;
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
