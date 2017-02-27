/*
 * spawn queue system
 *
 * queue for the spawning of creeps
 *
 */

var SpawnQueue = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }

    this.memory = Memory.queues;
    this.queue = Memory.queues.queue;
};

module.exports = SpawnQueue;
