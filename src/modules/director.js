
/*
 * Director system
 *
 * manages adding creep to director processes
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Director]');
logger.level = C.LOGLEVEL.DEBUG;

var Director = function() {
    // init
};

Director.prototype.addCreep = function(pid, creepName) {
    let process = Game.kernel.getProcessByPid(pid);

    if (!process) {
        logger.error('failed to get process pid: ' + pid +
            ', adding creep: ' + creep.name);
        return;
    }

    if (process.memory.creep.indexOf(creepName) === -1) {
        process.memory.creep.push(creepName);
        logger.debug(process.imageName + ':' + process.pid +
            ', adding creep: ' + creepName);
    }
};

Director.prototype.removeCreep = function(pid, creepName) {
    let process = Game.kernel.getProcessByPid(pid);

    if (!process) {
        logger.error('failed to get process pid: ' + pid +
            ', removing creep: ' + creep.name);
        return;
    }

    let index = process.memory.creep.indexOf(creepName);

    if (index !== -1) {
        process.memory.creep.splice(index, 1);
        logger.debug(process.imageName + ':' + process.pid +
            ', removing creep: ' + creepName);
    }
};

let director = new Director();

global.directorAddCreep = function(pid, creepName) {
    director.addCreep(pid, creepName);
    return true;
};

global.directorRemoveCreep = function(pid, creepName) {
    director.removeCreep(pid, creepName);
    return true;
};
