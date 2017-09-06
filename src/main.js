/*
 * Main Loop
 *
 */

// global methods
global.C        = require('constants');
global.Logger   = require('util.logger');

// init the logger
var logger = new Logger('[Main]');
logger.level = C.LOGLEVEL.DEBUG;

// prototypes
require('prototype.prototype');

// load utils
require('util.utils');

// load kernel
var Kernel = require('kernel');

// modules
require('modules.queue');
require('modules.role');
require('modules.work');
require('modules.mil');

module.exports.loop = function () {
    let cpuStart = Game.cpu.getUsed();

    // init the kernel
    Game.kernel = new Kernel;

    onTick();

    addTerminalLog(undefined, {
        command: 'init',
        status: 'OK',
        cpu: Game.cpu.getUsed(),
        output: 'memory usage: ' + (RawMemory.get().length / 1024).toFixed(2) + ' KB',
    });

    // start the kernel
    Game.kernel.run();

    // run modules
    Game.Mil.run();

    addTerminalLog(undefined, {
        command: 'main',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });

    runVisuals();
};

var onTick = function() {
    onTickVisuals();
    onTickQueue();
};
