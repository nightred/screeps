/*
 * Library for managing the spawning of creep for processes
 */

var logger = new Logger('[LibSpawnGroup]');

var libSpawnGroup = {

    doCreepSpawn: function() {
        if (this.memory._spawnComplete) return;

        this.memory.creeps = this.memory.creeps || {};
        let creeps = this.memory.creeps;

        let spawnDetails = this.memory.spawn;
        if (_.isEmpty(spawnDetails)) {
            this.memory._spawnComplete = 1;
            return;
        }

        this.memory._creepSpawning = this.memory._creepSpawning || {};
        let creepSpawning = this.memory._creepSpawning;

        if (creepSpawning._sleep && creepSpawning._sleep > Game.time) return;
        creepSpawning._sleep = Game.time + C.CREEP_SPAWN_SLEEP;

        for (const role in spawnDetails) {
            creeps[role] = creeps[role] || [];

            let spawnRecord = getQueueRecord(creepSpawning[role]);
            if (!spawnRecord && creepSpawning[role])
                creepSpawning[role] = undefined;

            if (spawnRecord && spawnRecord.spawned) {
                logger.debug('adding creep: ' + spawnRecord.name +
                    ', to process: ' + this.imageName + '\n' +
                    'role: ' + spawnRecord.role +
                    ', pid: ' + this.pid +
                    ', removing spawn queue: ' + this.memory.spawnId
                );

                if (creeps[role].indexOf(spawnRecord.name) === -1)
                    creeps[role].push(spawnRecord.name);
                delQueueRecord(creepSpawning[role]);
                creepSpawning[role] = undefined;
                spawnDetails[role]--;
                if (spawnDetails[role] <= 0) spawnDetails[role] = undefined;
            }

            if (spawnDetails[role] > 0 && !creepSpawning[role]) {
                let spawnId = addQueueRecordSpawn({
                    room: this.memory.spawnRoom,
                    role: role,
                    priority: 90,
                    creepArgs: this.memory.creepArgs,
                });
                creepSpawning[role] = spawnId;

                logger.debug('created spawn queue: ' + spawnId +
                    ', role: ' + role +
                    ', spawn room: ' + this.memory.spawnRoom + '\n' +
                    'process: ' + this.imageName +
                    ', pid: ' + this.pid
                );
            }
        }
    },

    doCreepCleanup: function() {
        this.memory.creeps = this.memory.creeps || {};
        let creeps = this.memory.creeps;

        for (const role in creeps) {
            creeps[role] = creeps[role] || [];
            let creepRole = creeps[role];
            let countCreep = creepRole.length;
            for (var i = (countCreep - 1); i >= 0; i--) {
                if (Game.creeps[creepRole[i]]) continue;
                logger.debug('removing non-existant creep: ' + creepRole[i] +
                    ', from process: ' + this.imageName +
                    ', pid: ' + this.pid
                );
                creepRole.splice(i, 1);
            }

            if (this.memory._spawnComplete && creepRole.length === 0)
                this.memory.creeps[role] = undefined;
        }
    },
};

module.exports = libSpawnGroup;
