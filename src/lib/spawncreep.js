/*
 * Library for managing the spawning of creep for processes
 */

var logger = new Logger('[LibSpawnCreep]');
logger.level = C.LOGLEVEL.DEBUG;

var libSpawnCreep = {

    doCreepSpawn: function() {
        if (_.isEmpty(this.spawnDetails)) return;

        if (this.spawnDetails.sleep && this.spawnDetails.sleep > Game.time) return;
        this.spawnDetails.sleep = Game.time + C.CREEP_SPAWN_SLEEP;

        this.removeOldCreep();

        let spawnRecord = getQueueRecord(this.spawnDetails.spawnId);
        if (!spawnRecord && this.spawnDetails.spawnId)
            this.spawnDetails.spawnId = undefined;

        if (spawnRecord && spawnRecord.spawned) {
            logger.debug('adding creep: ' + spawnRecord.name +
                ', role: ' + spawnRecord.role +
                ', to process: ' + this.imageName +
                ', pid: ' + this.pid +
                ', removing spawn queue record: ' + spawnRecord.id
            );
            this.addNewCreep(spawnRecord.name);
            delQueueRecord(this.spawnDetails.spawnId);
        }

        if (!this.creeps.length < this.spawnDetails.limit &&
            !this.spawnDetails.spawnId
        ) this.addSpawnQueue();
    },

    removeOldCreep: function() {
        let creepCount = creepGroup.creeps.length - 1;
        for (let i = creepCount; i >= 0; i--) {
            if (Game.creeps[this.creeps[i]]) continue;
            logger.debug('removing non-existant creep: ' + this.creeps[i] +
                ', from process: ' + this.imageName +
                ', pid: ' + this.pid
            );
            this.creeps.splice(i, 1);
        }
    },

    addNewCreep: function(creepName) {
        if (this.creeps.indexOf(creepName) >= 0) return;
        this.creeps.push(creepName);
    },

    addSpawnQueue: function() {
        let record = {
            rooms: [ this.spawnDetails.spawnRoom, ],
            role: this.spawnDetails.role,
            minSize: this.spawnDetails.minSize,
            maxSize: this.spawnDetails.maxSize,
            priority: this.spawnDetails.priority,
        };

        if (this.spawnDetails.creepArgs) {
            for (let item in this.spawnDetails.creepArgs) {
                record.creepArgs[item] = this.spawnDetails.creepArgs[item];
            };
        }

        let spawnId = addQueueRecordSpawn(record);
        this.spawnDetails.spawnId = spawnId;

        logger.debug('created spawn queue record: ' + spawnId +
            ', for role: ' + record.role +
            ', spawn room: ' + record.rooms +
            ', process: ' + this.imageName +
            ', pid: ' + this.pid
        );
    },

};

Object.defineProperty(libSpawnCreep, 'creeps', {
    get: function() {
        this.memory.creeps = this.memory.creeps || [];
        return this.memory.creeps;
    },
    set: function(value) {
        this.memory.creeps = this.memory.creeps || [];
        this.memory.creeps = value;
    },
});

Object.defineProperty(libSpawnCreep, 'spawnDetails', {
    get: function() {
        this.memory.spawnDetails = this.memory.spawnDetails || {};
        return this.memory.spawnDetails;
    },
    set: function(value) {
        this.memory.spawnDetails = this.memory.spawnDetails || {};
        this.memory.spawnDetails = value;
    },
});

module.exports = libSpawnCreep;
