/*
 * Main Loop
 */

// set constants
require('constants');

// global methods
global.Logger   = require('util.logger');
global.mod      = require('modules.loader');

// prototypes
require('prototype.prototype');
// utils
require('util.utils');
// modules
require('modules.queue');
require('modules.role');
require('modules.work');

// load kernel
var Kernel = require('kernel');
// load drivers
var DrvMemory = require('drv.memory');
// load processes
require('processes.registry');

// init the logger
var logger = new Logger('[Main]');

module.exports.loop = function () {

    // init the drivers
    Game.drvMemory = new DrvMemory;
    // init the kernel
    Game.kernel = new Kernel;
    
    // start the kernel
    Game.kernel.run();

    runVisuals();
};
