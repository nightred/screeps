/*
 * Task managment
 *
 * Manages the loading and running of tasks
 *
 */

var Task = function() {
    this.tasks = {};

    for (let i = 0; i < C.TASK_TYPES.length; i++) {
        this.tasks[C.TASK_TYPES[i]] = this.loadTask(C.TASK_TYPES[i]);
    }
};

Task.prototype.loadTask = function(name) {
    if (C.TASK_TYPES.indexOf(name) == -1) {
    if (C.DEBUG >= 2) { console.log('DEBUG - unknown task: ' + name); }
        return ERR_INVALID_ARGS;
    }

    let task = undefined;

    try {
        task = require('task.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load task: ' + name + ', error:\n' + e); }
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

    return this.tasks[creep.memory.task].run(creep);
}

module.exports = Task;
