/*
 * Memory Driver
 *
 * manages memory and storage of memory globals
 */

var logger = new Logger('[drv memory]');

var drvMemory = function() {
    if (global.nextTick && global.MemoryStore && global.nextTick == Game.time) {
        delete global.Memory
        global.Memory = global.MemoryStore
        RawMemory._parsed = global.MemoryStore
    } else {
        Memory;
        if (!global.nodeId) global.nodeId = getNodeId();
        global.MemoryStore = RawMemory._parsed
        logger.debug('node switched detected, reloading store' +
            ', new node ID: ' + global.nodeId
        );
    }

    global.nextTick = Game.time + 1;
};

var getNodeId = function() {
    return 'NI' + Math.random().toString(32).slice(8);
};

module.exports = drvMemory;
