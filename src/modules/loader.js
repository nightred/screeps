/*
 * module loader
 *
 * loads sub modules on request
 *
 */

var logger = new Logger('[Module Loader]');

var modules = {};

var handler = {
    get(modules, key, value) {
        var moduleName = 'modules.' + key.toLowerCase();
        if (!modules[moduleName]) {
            logger.debug('loading module ' + moduleName + ' to cache');
            modules[moduleName] = require(moduleName);
        }

        return modules[moduleName];
    }
};

module.exports = new Proxy({}, handler);
