/*
 * manage Spawn system
 *
 * handles spawning for all rooms
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Spawn]');
logger.level = C.LOGLEVEL.DEBUG;

var Spawn = function() {
    // init
};

/**
* @param {Room} room The room
**/
Spawn.prototype.doRoom = function(room) {
    let cpuStart = Game.cpu.getUsed();

    let log = { command: 'spawn', };

    let spawns = room.getSpawns();

    if (spawns.length <= 0) {
        return true;
    }

    for (let s = 0; s < spawns.length; s++) {
        let spawn = spawns[s];

        this.doSpawn(spawn, room);
    }

    log.status = 'OK';
    log.cpu = Game.cpu.getUsed() - cpuStart;

    addTerminalLog(room.name, log)
}

/**
* @param {Spawn} spawn The spawn to be used
* @param {Room} room The room
**/
Spawn.prototype.doSpawn = function(spawn, room) {
    if (spawn.spawning) {
        return true;
    }

    let energy = room.energyAvailable;

    let maxEnergy = room.energyCapacityAvailable * C.SPAWN_ENERGY_MAX;

    if (energy < C.ENERGY_CREEP_SPAWN_MIN) {
        return true;
    }

    let records = _.filter(Game.Queue.spawn.getQueue(), record =>
        (record.rooms.indexOf(room.name) >= 0 ||
        record.rooms.length == 0) &&
        !record.spawned
    );

    if (records.length <= 0) {
        return true;
    }

    let maxAge = Game.time - Math.min.apply(null, records.tick);

    records = _.sortBy(records, record =>
        100 + record.priority -
        (100 * ((Game.time - record.tick) / maxAge))
    );

    for (let r = 0; r < records.length; r++) {
        if (records[r].spawned) {
            continue;
        }

        let spawnEnergy = energy > maxEnergy ? maxEnergy : energy;

        if (records[r].minSize && spawnEnergy < records[r].minSize) {
            continue;
        }

        let minSize = 0;

        if (Game.time < (records[r].tick + C.SPAWN_COST_DECAY)) {
            minSize = (maxEnergy - C.ENERGY_CREEP_SPAWN_MIN) - ((maxEnergy / C.SPAWN_COST_DECAY) * (Game.time - records[r].tick));
            minSize = minSize >= 0 ? minSize : 0;
        }

        minSize += C.ENERGY_CREEP_SPAWN_MIN;

        if (minSize > spawnEnergy) {
            continue;
        }

        if (records[r].maxSize && spawnEnergy > records[r].maxSize) {
            spawnEnergy = records[r].maxSize;
        }

        let args = {};

        args.spawnRoom = room.name;
        args.role = records[r].role;

        if (records[r].creepArgs) {
            for (let item in records[r].creepArgs) {
                args[item] = records[r].creepArgs[item];
            };
        }

        let body = Game.Role.getBody(records[r].role, spawnEnergy, args);

        if (this.getBodyCost(body) > energy) {
            continue;
        }

        let name = this.doSpawnCreep(spawn, body, args);

        if (name != undefined && !(name < 0)) {
            energy -= this.getBodyCost(body);
            records[r].spawned = true;
            records[r].name = name;

            if (records[r].directorId) {
                Game.Director.addCreep(records[r].directorId, name)
            }

            logger.info('spawning' +
            ' room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>' +
            ', role: ' + records[r].role +
            ', parts: ' + Game.creeps[name].body.length +
            ', name: ' + name);

            break;
        }
    }

    return true;
};

/**
* Spawn the creep
* @param {Spawn} spawn The spawn to be used
* @param {array} body The creep body
* @param {Object} args Extra arguments
**/
Spawn.prototype.doSpawnCreep = function(spawn, body, args) {
    if (!spawn) { return ERR_INVALID_ARGS; }
    if (!Array.isArray(body) || body.length < 1) { return ERR_INVALID_ARGS; }

    let name = this.getName(args.role);

    return spawn.createCreep(body, name, args);
};

/**
* get a body for the creep
* @param {array} body The creep body
**/
Spawn.prototype.getBodyCost = function(body) {
    if (!Array.isArray(body)) { return ERR_INVALID_ARGS; }

    let cost = 0;
    for (let i = 0; i < body.length; i++) {
        cost += BODYPART_COST[body[i]];
    }

    return cost;
};

Spawn.prototype.getName = function(role) {
    let name = role.replace(/\./g, '_');

    name += '_' + Math.random().toString(36).substr(2, 1);
    name += '_' + Game.time % 1000;

    return name;
};

module.exports = Spawn;
