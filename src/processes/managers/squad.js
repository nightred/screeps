/*
 * Squad manager
 *
 * provides creep group control and spawning for all creep groups
 *
 * [data structure]
 * name
 * spawnRoom
 * workRooms
 * creepNew []
 * creepGroup {}
 * - group {}
 * - - name
 * - - creeps []
 * - - limit
 * - - spawnid
 * - - sleepSpawn
 * - - task
 * - - role
 * - - minSize
 * - - maxSize
 * - - creepsArgs
 */

var logger = new Logger('[Squad]');
logger.level = C.LOGLEVEL.DEBUG;

var Squad = function() {
    // init
};

Object.defineProperty(Squad.prototype, 'creepGroups', {
    get: function() {
        this.memory.creepGroups = this.memory.creepGroups || {};
        return this.memory.creepGroups;
    },
    set: function(value) {
        this.memory.creepGroups = this.memory.creepGroups || {};
        this.memory.creepGroups = value;
    },
});

Squad.prototype.run = function() {
    if (!squad.sleepNewCreep || squad.sleepNewCreep < Game.time) {
        this.doNewCreep();
        squad.sleepNewCreep = Game.time + C.SQUAD_SLEEP_NEWCREEP;
    }

    let groups = Object.keys(this.creepGroups);

    for (let i = 0; i < groups.length; i++) {
        let creepGroup = this.creepGroups[groups[i]];
        this.doGroup(creepGroup);
        this.doGroupSpawn(creepGroup);
    }
}

Squad.prototype.doGroup = function(creepGroup) {
    for (let i = (creepGroup.creeps.length - 1); i >= 0 ; i--) {
        let creep = Game.creeps[squad.creeps[i]];

        if (!creep) {
            logger.debug('removing non-existant creep: ' + squad.creeps[i] +
                ', squad: ' + this.memory.name +
                ', group: ' + creepGroup.name);
            creepGroup.creeps.splice(i, 1);
            continue;
        }

        if (creep.spawning)  continue;

        if (creep.isDespawnWarning()) {
            creep.doDespawn();
            continue;
        }

        if (!creep.process) {
            let imageName = creepGroup.task;
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
    }
};

CreepService.prototype.setGroup = function(args) {
    if (!this.creepGroups[args.name]) this.creepGroups[args.name] = {};

    let creepGroup = this.creepGroups[args.name];

    if (!creepGroup.name) creepGroup.name = args.name;
    if (!creepGroup.creeps) creepGroup.creeps = [];

    if (!creepGroup.task && args.task) creepGroup.task = args.task;
    if (!creepGroup.role && args.role) creepGroup.role = args.role;

    if (args.limit) creepGroup.limit = args.limit;
    if (args.minSize) creepGroup.minSize = args.minSize;
    if (args.maxSize) creepGroup.maxSize = args.maxSize;
    if (args.creepArgs) creepGroup.creepArgs = args.creepArgs;
};

CreepService.prototype.removeGroup = function(groupName) {
    if (!this.creepGroups[groupName]) return;
    delete this.creepGroups[groupName];
};

Squad.prototype.addNewCreep = function(creepName) {
    this.memory.newCreeps = this.memory.newCreeps || [];

    let creeps = this.memory.newCreeps;

    if (creeps.indexOf(creepName) === -1) {
        creeps.push(creepName);
        logger.debug(this.memory.name + ' registered new creep ' + creepName);
    }
};

Squad.prototype.doNewCreep = function() {
    this.memory.newCreeps = this.memory.newCreeps || [];

    let creeps = this.memory.newCreeps;

    for (let i = (creeps.length - 1); i >= 0; i--) {
        let creep = Game.creeps[creeps[i]];

        if (!creep) continue;

        let creepGroup = this.creepGroups[creep.memory.group];

        if (creepGroup.creeps.indexOf(creepName) === -1) {
            creepGroup.creeps.push(creepName);
            logger.debug(this.memory.name + ' added creep ' + creepName +
            ' to group ' + creep.memory.group);
        }

        creeps.splice(i, 1);
    }
};

Squad.prototype.doGroupSpawn = function(creepGroup) {
    // cooldown on spawn checks
    if (creepGroup.sleepSpawn && creepGroup.sleepSpawn > Game.time) {
        return;
    }
    creepGroup.sleepSpawn = Game.time + C.SQUAD_SLEEP_SPAWN;

    if (creepGroup.spawnId && !getQueueRecord(creepGroup.spawnId)) {
        this.memory.spawnId = undefined;
    }

    let count = creepGroup.creeps.length;

    if (count < creepGroup.limit && !creepGroup.spawnId) {
        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: creepGroup.role,
            minSize: creepGroup.minSize,
            maxSize: creepGroup.maxSize,
            squadPid: this.pid,
            creepArgs: {
                squad: this.memory.name,
                group: creepGroup.name,
                workRooms: this.memory.workRooms,
            },
        };

        if (creepGroup.creepArgs) {
            for (let item in creepGroup.creepArgs) {
                record.creepArgs[item] = creepGroup.creepArgs[item];
            };
        }

        creepGroup.spawnId = addQueueSpawn(record);
    }
};

registerProcess('managers/squad', Squad);
