/*
 * Squad manager
 *
 * provides creep group control and spawning for all creep groups
 *
 */

var logger = new Logger('[Squad]');

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
    let groups = Object.keys(this.creepGroups);

    for (let i = 0; i < groups.length; i++) {
        let creepGroup = this.creepGroups[groups[i]];
        this.doGroupSpawn(creepGroup);
        this.doGroup(creepGroup);
    }
}

Squad.prototype.doGroup = function(creepGroup) {
    for (let i = (creepGroup.creeps.length - 1); i >= 0 ; i--) {
        let creep = Game.creeps[creepGroup.creeps[i]];

        if (!creep) {
            logger.debug('removing non-existant creep: ' + creepGroup.creeps[i] +
                ', squad: ' + this.memory.squadName +
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

Squad.prototype.setGroup = function(args) {
    if (!this.creepGroups[args.name]) this.creepGroups[args.name] = {};

    let creepGroup = this.creepGroups[args.name];

    if (!creepGroup.name) creepGroup.name = args.name;
    if (!creepGroup.creeps) creepGroup.creeps = [];

    if (!creepGroup.task && args.task) creepGroup.task = args.task;
    if (!creepGroup.role && args.role) creepGroup.role = args.role;

    creepGroup.limit = args.limit;
    if (args.minSize) creepGroup.minSize = args.minSize;
    if (args.maxSize) creepGroup.maxSize = args.maxSize;
    if (args.creepArgs) creepGroup.creepArgs = args.creepArgs;
    if (args.priority) creepGroup.priority = args.priority;
};

Squad.prototype.removeGroup = function(groupName) {
    if (!this.creepGroups[groupName]) return;
    logger.debug('removed squad ' + groupName);
    delete this.creepGroups[groupName];
};

Squad.prototype.doGroupSpawn = function(creepGroup) {
    // cooldown on spawn checks
    if (creepGroup.sleepSpawn && creepGroup.sleepSpawn > Game.time) {
        return;
    }
    creepGroup.sleepSpawn = Game.time + C.SQUAD_SLEEP_SPAWN;

    let spawnRecord = getQueueRecord(creepGroup.spawnId);

    if (!spawnRecord && creepGroup.spawnId) {
        creepGroup.spawnId = undefined;
    }

    if (spawnRecord && spawnRecord.spawned) {
        if (creepGroup.creeps.indexOf(spawnRecord.name) === -1) {
            creepGroup.creeps.push(spawnRecord.name);
            logger.debug('adding creep ' + spawnRecord.name +
                ', to squad ' + this.memory.squadName +
                ', group ' + creepGroup.name
            );
        }

        logger.debug('removing spawn queue id: ' + spawnRecord.id +
            ', role: ' + spawnRecord.role
        );

        delQueueRecord(creepGroup.spawnId);
    }

    let count = creepGroup.creeps.length;

    if (count < creepGroup.limit && !creepGroup.spawnId) {
        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: creepGroup.role,
            minSize: creepGroup.minSize,
            maxSize: creepGroup.maxSize,
            squadPid: this.pid,
            priority: creepGroup.priority,
            creepArgs: {
                workRooms: this.memory.workRooms,
            },
        };

        if (creepGroup.creepArgs) {
            for (let item in creepGroup.creepArgs) {
                record.creepArgs[item] = creepGroup.creepArgs[item];
            };
        }

        creepGroup.spawnId = addQueueRecordSpawn(record);
    }
};

registerProcess('managers/squad', Squad);
