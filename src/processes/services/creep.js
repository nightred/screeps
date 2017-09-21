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
        this.doCreep(creep);
        creepCount++;
    }

    this.cleanCreep();

    addTerminalLog(undefined, {
        command: 'service creep',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
        output: ('creep count: ' + creepCount),
    });
};

CreepService.prototype.doCreep = function(creep) {
    if (creep.spawning || !creep.memory.task || creep.memory.despawn) return;

    if (creep.isDespawnWarning()) {
        this.doDespawn(creep);
        return;
    }

    if (!creep.process) {
        if (C.TASK_TYPES.indexOf(creep.memory.task) === -1) return;

        let imageName = creep.memory.task;
        let proc = Game.kernel.startProcess(this, imageName, {
            creepName: creep.name,
        });

        if (!proc) {
            logger.error('failed to create process ' + imageName +
                ' on creep ' + creep.name);
            return;
        }

        creep.process = proc;
    }
};

CreepService.prototype.cleanCreep = function() {
    if (this.memory.sleepCleanup && this.memory.sleepCleanup > Game.time) return;
    this.memory.sleepCleanup = C.MANAGE_MEMORY_TICKS + Game.time;

    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) this.cleanOldCreep(creepName);
    }
};

CreepService.prototype.doDespawn = function(creep) {
    if (!creep.memory.despawn) creep.doDespawn();
    if (creep.getOffExit()) return;
};

CreepService.prototype.cleanOldCreep = function(creepName) {
    let creepMemory = Memory.creeps[creepName];

    logger.debug('clearing non-existant creep memory name: ' + creepName +
        ' role: ' + creepMemory.role
    );
    
    if (creepMemory.workId) workRemoveCreep(creepName, creepMemory.workId);
    delete Memory.creeps[creepName];
};

registerProcess('services/creep', CreepService);
