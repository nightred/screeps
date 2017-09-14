/*
 * StructureTower common functions
 *
 * Provides common functions to all StructureTower
 *
 */

Object.defineProperty(StructureTower.prototype, 'workTask', {
    get: function() {
        if (!this.memory.workId) return false;
        return getQueueRecord(this.memory.workId);
    },
    set: function(value) {
        this.memory.workId = value;
    },
});
