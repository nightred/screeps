/*
 * Work managment
 *
 * Manages the loading and running of work
 *
 */

var Work = function() {
    this.work = {};

    for (let i = 0; i < C.WORK_TYPES.length; i++) {
        this.work[C.WORK_TYPES[i]] = this.loadWork(C.WORK_TYPES[i]);
    }
};

Work.prototype.loadWork = function(name) {
    if (C.WORK_TYPES.indexOf(name) == -1) {
    if (C.DEBUG >= 2) { console.log('DEBUG - unknown work: ' + name); }
        return ERR_INVALID_ARGS;
    }

    let work = undefined;

    try {
        work = require('work.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load work: ' + name + ', error:\n' + e); }
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
        } else if (creep.room.name == work.workRooms[0]) {
            Game.Work.addCreep(creep.name, creep.memory.workId);
        }
    } else {
        return this.work[work.task].run(creep, work);
    }

    if (creep.room.name != work.workRooms[0]) {
        creep.moveToRoom(work.workRooms[0]);
    }

    return true
}

Work.prototype.getWork = function(workTasks, creep, args) {
    if (!Array.isArray(workTasks)) { return ERR_INVALID_ARGS; }

    args = args || {};

    let queue = Game.Queue.work.getQueue();

    queue = _.filter(queue, record =>
        workTasks.indexOf(record.task) >= 0 &&
        (!args.room || record.workRooms.indexOf(args.room) >= 0) &&
        (!args.spawnRoom || record.spawnRoom.indexOf(args.spawnRoom) >= 0) &&
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

Work.prototype.findWork = function(task, room) {
    if (C.WORK_FIND.indexOf(task) == -1) { return ERR_INVALID_ARGS; }
    if (!room) { return ERR_INVALID_ARGS; }

    return this.work[task].find(room);
};

Work.prototype.doFlag = function(flag) {
    if (!flag) { return ERR_INVALID_ARGS; }

    if (flag.memory.init) {
        return true;
    }

    let flagName = flag.name;
    let flagVars = flagName.split(':');

    let roomName = flag.pos.roomName;

    if (C.WORK_FLAG_TYPES.indexOf(flagVars[1]) == -1) {
        flag.memory.result = 'invalid task';
        return false;
    }

    flag.memory.workId = this.work[flagVars[1]].flag(roomName, flagVars);

    flag.memory.init = 1;

    return true;
};

module.exports = Work;
