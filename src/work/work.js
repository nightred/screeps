/*
 * Work managment
 *
 * Manages the loading and running of work
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Work]');
logger.level = C.LOGLEVEL.DEBUG;

var Work = function() {
    this.work = {};

    for (let i = 0; i < C.WORK_TYPES.length; i++) {
        this.work[C.WORK_TYPES[i]] = this.loadWork(C.WORK_TYPES[i]);
    }
};

Work.prototype.loadWork = function(name) {
    if (C.WORK_TYPES.indexOf(name) == -1) {
        logger.warn('invalid work: ' + name + ' load reqested');
        return ERR_INVALID_ARGS;
    }

    let work = undefined;

    try {
        work = require('work.' + name);
    } catch(e) {
        logger.error('failed to load work: ' + name + ', error:\n' + e);
    }

    return work;
};

Work.prototype.runWork = function(creep) {
    if (!creep) { return ERR_INVALID_ARGS; }

    let work = Game.Queue.getRecord(creep.memory.workId);

    if (!work) {
        return false;
    }

    if (work.creeps.indexOf(creep.name) == -1) {
        if (work.creeps.length >= work.creepLimit) {
            return false;
        } else if (creep.room.name == work.workRoom) {
            Game.Work.addCreep(creep.name, creep.memory.workId);
        }
    } else {
        return this.work[work.task].run(creep, work);
    }

    if (creep.room.name != work.workRoom) {
        creep.moveToRoom(work.workRoom);
    }

    return true
}

Work.prototype.getWork = function(workTasks, creep, args) {
    if (!Array.isArray(workTasks)) { return ERR_INVALID_ARGS; }

    args = args || {};

    let queue = Game.Queue.work.getQueue();

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
    if (!creepName) { return ERR_INVALID_ARGS; }
    if (isNaN(id)) { return ERR_INVALID_ARGS; }

    let work = Game.Queue.getRecord(id);

    if (!work) {
        return false;
    }

    if (work.creeps.indexOf(creepName) != -1) {
        return true;
    }

    work.creeps.push(creepName);

    return true;
};

Work.prototype.removeCreep = function(creepName, id) {
    if (!creepName) { return ERR_INVALID_ARGS; }
    if (isNaN(id)) { return ERR_INVALID_ARGS; }

    let work = Game.Queue.getRecord(id);

    if (!work) {
        return true;
    }

    if (!work.creeps) {
        return true;
    }

    let index = work.creeps.indexOf(creepName);

    if (index == -1) {
        return true;
    }

    work.creeps.splice(index, 1);

    return true;
};

Work.prototype.runFindWork = function(task, room) {
    if (C.WORK_FIND.indexOf(task) == -1) { return ERR_INVALID_ARGS; }
    if (!room) { return ERR_INVALID_ARGS; }

    return this.work[task].find(room);
};

Work.prototype.doFlag = function(flag) {
    if (!flag) { return ERR_INVALID_ARGS; }

    if (!flag.memory.workId) {
        let flagVars = flag.name.split(':');

        let roomName = flag.pos.roomName;

        if (C.WORK_FLAG_TYPES.indexOf(flagVars[1]) == -1) {
            flag.memory.result = 'invalid task';

            return false;
        }

        flag.memory.workId = this.work[flagVars[1]].flag(roomName, flagVars);
    }

    let task = Game.Queue.getRecord(flag.memory.workId);

    if (!task.pos) {
        task.pos = {};
    }

    task.pos.room = task.pos.room != flag.pos.roomName ? flag.pos.roomName : task.pos.room;
    task.pos.x = task.pos.x != flag.pos.x ? flag.pos.x : task.pos.x;
    task.pos.y = task.pos.y != flag.pos.y ? flag.pos.y : task.pos.y;

    return true;
};

module.exports = Work;