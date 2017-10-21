/*
 * Kernel
 *
 * main kernel of the system
 */

var logger = new Logger('[drv memory]');

var drvMemory = function() {
    if (nextTick && MemoryStore && nextTick == Game.time) {
        delete global.Memory
        global.Memory = MemoryStore
        RawMemory._parsed = MemoryStore
    } else {
        Memory;
        global.MemoryStore = RawMemory._parsed
    }

    global.nextTick = Game.time + 1;
};

modules.export = drvMemory;
