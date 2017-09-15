/*
 * Work managment
 *
 * Manages the loading and running of work
 *
 */

var logger = new Logger('[Work]');
logger.level = C.LOGLEVEL.DEBUG;

// registry of work
var workRegistry = {
    registry: {},

    register: function(workName, workImage) {
        this.registry[workName] = workImage;
    },

    getWork: function(workName) {
        if (!this.registry[workName]) return;
        return this.registry[workName];
    },
};

global.registerWork = function(workName, workImage) {
    workRegistry.register(workName, workImage);
    return true;
};

var Work = function() {
    // init
};

Work.prototype.doWorkTask = function(creep) {
    let workTask = getQueueRecord(creep.memory.workId);

    if (!workTask) {
        creep.memory.workId = undefined;
        return;
    }

    let work = workRegistry.getWork(workTask.task);

    if (!work) {
        logger.error('failed to load work task: ' + workTask.task);
        delQueueRecord(creep.memory.workId)
        creep.memory.workId = undefined;
        return;
    }

    if (workTask.creeps.indexOf(creep.name) === -1) {
        if (workTask.creeps.length >= workTask.creepLimit) {
            logger.debug('work task id: ' + creep.memory.workId +
                ', full when adding creep: ' + creep.name);
            return;
        } else {
            this.addCreep(creep.name, creep.memory.workId);
        }
    }

    work.run(creep, workTask);

    if (workTask.completed) {
        logger.debug('task: ' + workTask.task +
            ', completed by creep: ' + creep.name +
            ', id: ' + creep.memory.workId);
        delQueueRecord(creep.memory.workId)
        creep.memory.workId = undefined;
    };
}

Work.prototype.getWorkTask = function(workTasks, creep, args) {
    if (!Array.isArray(workTasks)) { return ERR_INVALID_ARGS; }

    args = args || {};

    let queue = getQueueWork();

    queue = _.filter(queue, record =>
        workTasks.indexOf(record.task) >= 0 &&
        (!args.rooms || args.rooms.indexOf(record.workRoom) >= 0) &&
        (!args.room || record.workRoom == args.room) &&
        (!args.spawnRoom || record.spawnRoom == args.spawnRoom) &&
        record.creeps.indexOf(creep.name) == -1 &&
        record.creeps.length < record.creepLimit
    );

    let maxAge = Game.time - Math.min.apply(null, queue.tick);

    queue = _.sortBy(queue, record =>
        100 + record.priority -
        (100 * ((Game.time - record.tick) / maxAge))
    );

    if (!queue || queue.length <= 0) {
        return false;
    }

    return queue[0].id;
};

Work.prototype.addCreep = function(creepName, id) {
    let workTask = getQueueRecord(id);

    if (!workTask) {
        logger.error('failed to load work task id: ' + id +
            ', when adding creep: ' + creepName);
        return false;
    }

    if (workTask.creeps.indexOf(creepName) === -1) {
        workTask.creeps.push(creepName);
    }

    return true;
};

Work.prototype.removeCreep = function(creepName, id) {
    let work = getQueueRecord(id);

    if (!work) {
        logger.error('failed to load work task id" ' + id +
            ', when removing creep: ' + creepName);
        return true;
    }

    let index = work.creeps.indexOf(creepName);

    if (index !== -1) {
        work.creeps.splice(index, 1);
    }

    return true;
};

Work.prototype.doWorkFind = function(task, room) {
    let work = workRegistry.getWork(task);

    if (!work) {
        logger.error('work find failed to load work task: ' + workTask.task);
        return false;
    }

    work.find(room);
};

Work.prototype.doFlag = function(flag) {
    if (!flag.memory.workId) {
        let flagVars = flag.name.split(':');

        let roomName = flag.pos.roomName;

        if (C.WORK_FLAG_TYPES.indexOf(flagVars[1]) == -1) {
            logger.debug('invalid work task requested by flag: ' + flag.name);
            flag.memory.result = 'invalid task';
            return false;
        }

        let work = workRegistry.getWork(flagVars[1]);

        if (!work) {
            logger.error('flag request failed to load work task: ' + workTask.task);
            return false;
        }

        flag.memory.workId = work.flag(roomName, flagVars);
    }

    let task = getQueueRecord(flag.memory.workId);

    if (!task.pos) {
        task.pos = {};
    }

    task.pos.room = task.pos.room != flag.pos.roomName ? flag.pos.roomName : task.pos.room;
    task.pos.x = task.pos.x != flag.pos.x ? flag.pos.x : task.pos.x;
    task.pos.y = task.pos.y != flag.pos.y ? flag.pos.y : task.pos.y;

    return true;
};

let work = new Work();

global.workRemoveCreep = function(creepName, workId) {
    work.removeCreep(creepName, workId);
    return true;
};

global.workAddCreep = function(creepName, workId) {
    work.addCreep(creepName, workId);
    return true;
};

global.doFlagWork = function(flag) {
    work.doFlag(flag);
    return true;
};

global.doWorkFind = function(task, room) {
    work.doWorkFind(task, room);
    return true;
};

global.doWorkTask = function(creep) {
    return work.doWorkTask(creep);
};

global.getWorkTask = function(workTask, creep, args) {
    return work.getWorkTask(workTask, creep, args);
};

// load the work tasks
require('modules.work.terminal.empty');
require('modules.work.tower.fill');
require('modules.work.attack');
require('modules.work.claim');
require('modules.work.construction');
require('modules.work.defense');
require('modules.work.dismantle');
require('modules.work.repair');
require('modules.work.signcontroller');
