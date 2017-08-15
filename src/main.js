/*
 * Main Loop
 *
 */

// prototypes
require('prototype.prototype');

// global methods
global.C            = require('constants');
global.cli          = require('util.cli');
global.utils        = new (require('util.utils'));
global.logger       = new (require('util.logger'));

var Kernel          = require('kernel');
var Logger = require('util.logger');

var logger = new Logger('[Main]');
logger.level = C.LOGLEVEL.DEBUG;

module.exports.loop = function () {
    var kernel = new Kernel;

    kernel.run();
}
