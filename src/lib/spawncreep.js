/*
 * Library for managing the spawning of creep for processes
 */

var logger = new Logger('[LibSpawnCreep]');
logger.level = C.LOGLEVEL.DEBUG;

var libSpawnCreep = {

    doCreepSpawn: function() {
        this.memory.creeps = this.memory.creeps || [];

        let spawnDetails = this.getSpawnDetails();
        if (_.isEmpty(spawnDetails)) return;

        if (spawnDetails.sleep && spawnDetails.sleep > Game.time) return;
        spawnDetails.sleep = Game.time + C.CREEP_SPAWN_SLEEP;

        this.removeOldCreep();

        let spawnRecord = getQueueRecord(this.memory.spawnId);
        if (!spawnRecord && this.memory.spawnId)
            this.memory.spawnId = undefined;

        if (spawnRecord && spawnRecord.spawned) {
            logger.debug('adding creep: ' + spawnRecord.name +
                ', role: ' + spawnRecord.role +
                ', to process: ' + this.imageName +
                ', pid: ' + this.pid +
                ', removing spawn queue record: ' + this.memory.spawnId
            );
            this.addNewCreep(spawnRecord.name);
            delQueueRecord(this.memory.spawnId);
            this.memory.spawnId = undefined;
        }

        if (spawnDetails.limit > 0 && !this.memory.spawnId &&
            this.memory.creeps.length < spawnDetails.limit
        ) this.addSpawnQueue();
    },

    removeOldCreep: function() {
        let creepCount = this.memory.creeps.length - 1;
        for (let i = creepCount; i >= 0; i--) {
            if (Game.creeps[this.memory.creeps[i]]) continue;
            logger.debug('removing non-existant creep: ' + this.memory.creeps[i] +
                ', from process: ' + this.imageName +
                ', pid: ' + this.pid
            );
            this.memory.creeps.splice(i, 1);
        }
    },

    addNewCreep: function(creepName) {
        if (this.memory.creeps.indexOf(creepName) >= 0) return;
        this.memory.creeps.push(creepName);
    },

    addSpawnQueue: function() {
        let spawnDetails = this.getSpawnDetails();

        let record = {
            rooms: [ spawnDetails.spawnRoom, ],
            role: spawnDetails.role,
            minSize: spawnDetails.minSize,
            maxSize: spawnDetails.maxSize,
            priority: spawnDetails.priority,
            creepArgs: {},
        };

        if (spawnDetails.creepArgs) {
            for (let item in spawnDetails.creepArgs) {
                record.creepArgs[item] = spawnDetails.creepArgs[item];
            };
        }

        let spawnId = addQueueRecordSpawn(record);
        this.memory.spawnId = spawnId;

        logger.debug('created spawn queue record: ' + spawnId +
            ', for role: ' + record.role +
            ', spawn room: ' + record.rooms +
            ', process: ' + this.imageName +
            ', pid: ' + this.pid
        );
    },

    getSpawnDetails: function() {
        this.memory.spawnDetails = this.memory.spawnDetails || {};
        return this.memory.spawnDetails;
    },

    setSpawnDetails: function(value) {
        this.memory.spawnDetails = this.memory.spawnDetails || {};
        this.memory.spawnDetails = value;
    },

};

module.exports = libSpawnCreep;
