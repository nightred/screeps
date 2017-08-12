/*
 * Task managment
 *
 * Manages the loading and running of tasks
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Task]');
logger.level = C.LOGLEVEL.DEBUG;

var Task = function() {
    this.tasks = {};

    for (let i = 0; i < C.TASK_TYPES.length; i++) {
        this.tasks[C.TASK_TYPES[i]] = this.loadTask(C.TASK_TYPES[i]);
    }
};

Task.prototype.loadTask = function(name) {
    if (C.TASK_TYPES.indexOf(name) == -1) {
        logger.warn('invalid task: ' + name + ' load requested');

        return ERR_INVALID_ARGS;
    }

    let task = undefined;

    try {
        task = require('task.' + name);
    } catch(e) {
        logger.error('failed to load task: ' + name + ', error:\n' + e);
    }

    return task;
};

Task.prototype.runTask = function(creep) {
    if (!creep) { return ERR_INVALID_ARGS; }

    if (!creep.memory.task) {
        return false;
    }

    if (creep.getOffExit()) {
        return true;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return true;
    }

    if (C.TASK_TYPES.indexOf(creep.memory.task) == -1) {
        return false;
    }

    return this.tasks[creep.memory.task].run(creep);
}

module.exports = Task;
