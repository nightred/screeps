/*
 * Creep managment
 *
 * This manages the roles and tasks for creeps
 */

var Logger = require('util.logger');

var logger = new Logger('[Service Creep]');
logger.level = C.LOGLEVEL.INFO;

var Creep = function() {
    // init
};

Creep.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    this.gc();

    let creepCount = 0;

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (!creep) {
            this.gc(name);
        }

        if (creep.spawning || !creep.memory.task) {
            continue;
        }

        if (creep.isDespawnWarning()) {
            this.doDespawn(creep);
            continue;
        }

        if (!creep.process) {
            let imageName = creep.memory.task;
            let p = Game.kernel.startProcess(this, imageName, {
                creepName: creep.name,
            });

            if (!p) {
                logger.error('failed to create process ' + imageName +
                    ' on creep ' + creep.name);
                continue;
            }

            creep.process = p;
        }

        creepCount++;
    }

    let log = {
        command: 'service creep',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    };
    log.output = 'creep count: ' + creepCount + ' avg cpu: ' +
        (log.cpu / creepCount).toFixed(2);
    addTerminalLog(undefined, log)
};

Creep.prototype.doDespawn = function(creep) {
    if (!creep) { return ERR_INVALID_ARGS; }

    if (!creep.memory.despawn || creep.memory.despawn == undefined) {
        creep.setDespawn();
    }

    if (creep.getOffExit()) {
        return true;
    }

    return true;
};

Creep.prototype.gc = function(name) {
    if (Memory.creeps[name].workId) {
        workRemoveCreep(name, Memory.creeps[name].workId);
    }

    logger.debug('clearing non-existant creep memory name: ' + name +
        ' role: ' + Memory.creeps[name].role);

    delete Memory.creeps[name];
};

registerProcess('services/creep', Creep);
