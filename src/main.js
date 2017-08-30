/*
 * Main Loop
 *
 */

// global methods
global.C = require('constants');

// init the logger
var Logger = require('util.logger');

var logger = new Logger('[Main]');
logger.level = C.LOGLEVEL.DEBUG;

// prototypes
require('prototype.prototype');

// load utils
require('util.utils');

// load kernel
var Kernel = require('kernel');

// modules
var Director        = require('director.director');
var Queue           = require('queue.queue');
var Mil             = require('mil.mil');
require('modules.role');
require('modules.work');

module.exports.loop = function () {
    let cpuStart = Game.cpu.getUsed();

    // init the kernel
    Game.Kernel         = new Kernel;

    // hook modules
    Game.Director       = new Director;
    Game.Queue          = new Queue;
    Game.Mil            = new Mil;

    resetOnTick();

    addTerminalLog(undefined, {
        command: 'init',
        status: 'OK',
        cpu: Game.cpu.getUsed(),
        output: 'memory usage: ' + (JSON.stringify(RawMemory).length / 1024).toFixed(2) + ' KB',
    });

    // start the kernel
    Game.Kernel.run();

    addTerminalLog(undefined, {
        command: 'starting main',
    });

    // run modules
    Game.Queue.run();
    Game.Manage.run();
    Game.Director.run();
    Game.Mil.run();

    addTerminalLog(undefined, {
        command: 'main',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });

    runVisuals();

};

var resetOnTick = function() {
    resetVisuals();
};
