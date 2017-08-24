/*
 * Creep managment
 *
 * This manages the roles and tasks for creeps
 */

var Logger = require('util.logger');

var logger = new Logger('[Manage Creeps]');
logger.level = C.LOGLEVEL.INFO;

var manageCreep = function() {
    Memory.world = Memory.world || {};
    this.memory = Memory.world;
};

manageCreep.prototype.gc = function() {
    this.memory.creepCleanUp = this.memory.creepCleanUp || Game.time;

    if ((this.memory.creepCleanUp + C.MANAGE_WAIT_TICKS) > Game.time) {
        return true;
    }

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            if (Memory.creeps[name].workId) {
                Game.Work.removeCreep(name, Memory.creeps[name].workId);
            }

            logger.debug('clearing non-existant creep memory name: ' + name + ' role: ' + Memory.creeps[name].role);
            delete Memory.creeps[name];
        }
    }

    this.memory.creepCleanUp = Game.time;
    return true;
};

manageCreep.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    this.gc();

    let creepCount = 0;

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.spawning || !creep.memory.task) {
            continue;
        }

        if (creep.isDespawnWarning()) {
            this.doDespawn(creep);
            continue;
        }

        Game.Task.runTask(creep);

        creepCount++;
    }

    let log = {
        command: 'creep tasks',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    };
    log.output = 'creep count: ' + creepCount + ' avg cpu: ' +
        (log.cpu / creepCount).toFixed(2);
    addTerminalLog(undefined, log)
};

manageCreep.prototype.doDespawn = function(creep) {
    if (!creep) { return ERR_INVALID_ARGS; }

    if (!creep.memory.despawn || creep.memory.despawn == undefined) {
        creep.setDespawn();
    }

    if (creep.getOffExit()) {
        return true;
    }

    return true;
};

manageCreep.prototype.doDespawnOnContainer = function(creep) {
    if (!creep) { return false; }

    let target = Game.getObjectById(creep.memory.goingTo);
    if (!target) {
        creep.memory.goingTo = false;
        return false;
    }

    if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
        if (creep.room.memory.deSpawnContainerId && creep.room.memory.spawnId) {
            logger.debug('recycling ' + creep.memory.role + ' ' + creep.name);
            let roomSpawn = Game.getObjectById(creep.room.getSpawn());
            roomSpawn.recycleCreep(creep);
        } else {
            creep.suicide();
        }
    }

    creep.moveTo(target.pos.x, target.pos.y);

    return true;
};

manageCreep.prototype.getDespawnContainer = function(creep) {
    if (!creep) { return false; }

    let targets = creep.room.getContainers();
    if (targets.length == 0) {
        creep.suicide();

        return false;
    }
    targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));

    return creep.setGoingTo(targets[0]);
};

module.exports = manageCreep;
