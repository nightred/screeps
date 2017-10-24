/*
 * Spawn service
 *
 * provides spawning of creeps for all controlled spawn points
 *
 */

var logger = new Logger('[Spawn Service]');


var SpawnService = function() {
    // init
};

SpawnService.prototype.run = function() {
    this.queue = getQueueSpawn();
    let queueLen = this.queue.length;
    if (queueLen > 0) {
        for (const i in Game.spawns) {
            const spawn = Game.spawns[i];
            this.doSpawnRun(spawn);
        }
    }
};

SpawnService.prototype.doSpawnRun = function(spawn) {
    if (spawn.spawning) return;

    let roomName = spawn.room.name;
    let roomEnergy = spawn.room.energyAvailable;
    if (roomEnergy < C.SPAWN_ENERGY_MIN) return;
    let maxEnergy = spawn.room.energyCapacityAvailable * C.SPAWN_ENERGY_MAX;
    let spawnEnergy = roomEnergy > maxEnergy ? maxEnergy : roomEnergy;

    let spawnQueue = _.filter(this.queue, record =>
        !record.spawned && record.room == roomName
    );
    if (spawnQueue.length === 0) return;

    let oldestTick = Game.time - Math.min.apply(null, spawnQueue.tick);
    spawnQueue = _.sortBy(spawnQueue, record =>
        record.priority +
        100 - (100 * ((Game.time - record.tick) / oldestTick))
    );

    for (var i = 0; i < spawnQueue.length; i++) {
        let record = spawnQueue[i];
        if (!record.creepArgs) record.creepArgs = {};
        record.creepArgs.spawnRoom = roomName;
        record.creepArgs.role = record.role;
        let creepMem = record.creepArgs;
        
        let body = getRoleBody(record.role, spawnEnergy, creepMem);
        let bodyCost = getBodyCost(body);
        if (bodyCost > spawnEnergy) continue;
        let name = getName(record.role);

        let result = spawn.spawnCreep(body, name, {
            memory: creepMem,
        });

        if (result === 0) {
            record.spawned = true;
            record.name = name;

            logger.info('spawning ' + name +
                ' role ' + record.role +
                ' in room ' + spawn.room.toString() +
                ' for ' + bodyCost + 'e'
            );
            break;
        }
    }
};

/**
* get a body for the creep
* @param {array} body The creep body
**/
var getBodyCost = function(body) {
    let cost = 0;
    for (var i = 0; i < body.length; i++) {
        cost += BODYPART_COST[body[i]];
    }
    return cost;
};

var getName = function(role) {
    return role.replace(/\./g, '_') + '_' +
        Math.random().toString(36).substr(2, 1) +
        Game.time % 1000;
};

registerProcess(C.SERVICES_SPAWN, SpawnService);
