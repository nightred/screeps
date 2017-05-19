/*
 * task managment
 *
 * This manages the tasks for creeps
 */

var manageTask = function() {
    this.tasks = {};
    for (let i = 0; i < C.WORK_TASKS.length; i++) {
        this.tasks[C.WORK_TASKS[i]] = this.getTask(C.WORK_TASKS[i]);
    }
};

/**
* @param {Creep} creep The creep object
**/
manageTask.prototype.doTask = function(creep) {
    if (!creep) { return -1; }

    let task = Game.Queue.getRecord[creep.memory.workId];
    if (!task) { return false; }

    if (task.creeps.length >= task.creepLimit && task.creeps.indexOf(creep.name) < 0) {
        return false;
    }

    if (creep.room.name != task.workRooms[0]) {
        creep.moveToRoom(task.workRooms[0]);
        return true;
    } else if (task.creeps.indexOf(creep.name) < 0) {
        Game.Queue.work.addCreep(creep.name, creep.memory.workId);
    }

    return this.tasks[task.task].doTask(creep, task);
};

/**
* @param {Task} task the task object
**/
manageTask.prototype.doManagedTask = function(task) {
    if (!task) { return -1; }

    return this.tasks[task.task].doTaskManaged(task);
};

/**
* @param {Task} task the task to run
* @param {Room} room the room object
**/
manageTask.prototype.doFindTask = function(task, room) {
    if (!task) { return -1; }
    if (!room) { return -1; }

    return this.tasks[task].doTaskFind(room);
};

/**
* @param {Task} task the name of the task to be created
* @param {Room} room the room object
**/
manageTask.prototype.createTask = function(task, room) {
    if (!creep) { return -1; }
    if (C.WORK_TASKS.indexOf(task) < 0) { return -1; }

    return this.tasks[task].createTask(task, room);
};

manageTask.prototype.getTask = function(name) {
    if (C.WORK_TASKS.indexOf(name) < 0) {
        if (C.DEBUG >= 2) { console.log('DEBUG - unknown task: ' + name); }
        return -1;
    }

    let task = false;
    try {
        task = require('task.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load task: ' + name + ', error:\n' + e); }
    }
    return task;
};

manageTask.prototype.cooldown = function(task) {
    if (!task) { return -1; }

    task.manageTick = task.manageTick || 0;
    if ((task.manageTick + C.MANAGE_WAIT_TICKS) > Game.time) {
        return true;
    }
    task.manageTick = Game.time;
    return false;
};

module.exports = manageTask;
