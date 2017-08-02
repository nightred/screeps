/*
 * Main Loop
 *
 */

// prototypes
require('prototype.prototype');

// global methods
global.C            = require('constants');
global.cli          = require('util.cli');
global.utils        = require('util.utils');

var Kernel          = require('kernel');

module.exports.loop = function () {
    var kernel = new Kernel;

    kernel.run();
}
