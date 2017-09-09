/*
 * Creep managment
 *
 * This manages the roles and tasks for creeps
 */

var logger = new Logger('[Service Creep]');
logger.level = C.LOGLEVEL.INFO;

var CreepService = function() {
    // init
};

CreepService.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    let creepCount = 0;

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (!creep) this.cleanOldCreep(name);

        if (creep.spawning || !creep.memory.task || creep.memory.despawn) continue;

        if (creep.isDespawnWarning()) {
            this.doDespawn(creep);
            continue;
        }

        if (!creep.process) {
            let imageName = creep.memory.task;
            let proc = Game.kernel.startProcess(this, imageName, {
                creepName: creep.name,
            });

            if (!proc) {
                logger.error('failed to create process ' + imageName +
                    ' on creep ' + creep.name);
                continue;
            }

            creep.process = proc;
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

CreepService.prototype.doDespawn = function(creep) {
    if (!creep) { return ERR_INVALID_ARGS; }

    if (!creep.memory.despawn || creep.memory.despawn == undefined) {
        creep.setDespawn();
    }

    if (creep.getOffExit()) {
        return true;
    }

    return true;
};

CreepService.prototype.cleanOldCreep = function(creepName) {
    let creepMemory = Memory.creeps[creepName];

    if (creepMemory.workId) {
        workRemoveCreep(creepName, creepMemory.workId);
    }

    logger.debug('clearing non-existant creep memory name: ' + name +
        ' role: ' + creepMemory.role);

    delete Memory.creeps[name];
};

registerProcess('services/creep', CreepService);
