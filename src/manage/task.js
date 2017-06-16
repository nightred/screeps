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

manageTask.prototype.doManage = function() {
    this.doManagedTasks();
};

/**
* @param {Creep} creep The creep object
**/
manageTask.prototype.doTask = function(creep) {
    if (!creep) { return -1; }

    let task = Game.Queue.getRecord(creep.memory.workId);
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
manageTask.prototype.doManagedTasks = function() {
    let taskList = _.sortBy(_.filter(Game.Queue.work.getQueue(), task =>
        task.managed
    ), task => task.priority);

    if (!taskList || taskList.length < 0) { return false; }

    for (let i =0; i < taskList.length; i++) {
        this.tasks[taskList[i].task].doTaskManaged(taskList[i])
    }

    return true;
};

/**
* @param {Room} room the room object
* @param {Tasks} tasks the tasks to run
**/
manageTask.prototype.doTaskFind = function(room, tasks) {
    if (!room) { return ERR_INVALID_ARGS; }
    if (!Array.isArray(tasks)) { return ERR_INVALID_ARGS; }

    tasks = tasks || C.WORK_TASKS;

    for (let i = 0; i < tasks.length; i++) {
        this.tasks[tasks[i]].doTaskFind(room)
    }

    return true;
};

/**
* @param {Task} task the name of the task to be created
* @param {Room} room the room object
**/
manageTask.prototype.createTask = function(args, room) {
    if (!room) { return ERR_INVALID_ARGS; }
    if (!Array.isArray(args)) { return ERR_INVALID_ARGS; }

    return this.tasks[args[1]].createTask(args, room);
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

manageTask.prototype.doFlag = function(flag) {
    if (!flag) { return ERR_INVALID_ARGS; }

    let flagName = flag.name;
    let args = flagName.split(':');

    if (C.WORK_TASKS.indexOf(args[1]) < 0) {
        flag.memory.result = 'invalid task';
        return false;
    }

    if (!flag.memory.init) {
        flag.memory.jobId = this.createTask(args, flag.pos.roomName);
        flag.memory.init = 1;
    }

    switch (flag.secondaryColor) {
    case COLOR_RED:
        // update flag data

        if (!flag.memory.withFlag) {
            flag.memory.withFlag = 1;
        }

        break;
    }

    return true;
};

module.exports = manageTask;
