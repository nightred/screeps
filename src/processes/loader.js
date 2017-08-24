/*
 * Loader
 */

var Logger = require('util.logger');

var logger = new Logger('[Loader]');
logger.level = C.LOGLEVEL.DEBUG;

var Loader = function() {
    // init
};

Loader.prototype.run = function() {

};



registerProcess('loader/init', Loader);
