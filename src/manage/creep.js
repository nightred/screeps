/*
 * Creep managment
 *
 * This manages the roles and tasks for creeps
 */

var manageCreep = function() {
    if (!Memory.queues) { Memory.queues = {}; }
    if (!Memory.queues.queue) { Memory.queues.queue = {}; }
    this.queue = Memory.queues.queue;

    this.roles = {};
    for (let i = 0; i < C.ROLE_TYPES.length; i++) {
        this.roles[C.ROLE_TYPES[i]] = this.getRole(C.ROLE_TYPES[i]);
    }

    this.tasks = {};
    for (let i = 0; i < C.WORK_TASKS.length; i++) {
        this.tasks[C.WORK_TASKS[i]] = this.getTask(C.WORK_TASKS[i]);
    }
};

manageCreep.prototype.doRole = function(creep) {
    if (!creep) { return false; }
    if (C.ROLE_TYPES.indexOf(creep.memory.role) < 0) { return false; }

    return this.roles[creep.memory.role].doRole(creep);
};

WorkQueue.prototype.doTask = function(creep) {
    if (!creep) { return -1; }

    if (!this.queue[creep.memory.workId]) { return false; }
    let task = this.queue[creep.memory.workId];

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
}

manageCreep.prototype.getRole = function(name) {
    if (C.ROLE_TYPES.indexOf(name) < 0) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name); }
        return -1;
    }

    let role = false;
    try {
        role = require('role.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name + ', error:\n' + e); }
    }
    return role;
};

WorkQueue.prototype.getTask = function(name) {
    if (C.WORK_TASKS.indexOf(name) < 0) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load work task: ' + name); }
        return -1;
    }

    let task = false;
    try {
        task = require('task.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load work task: ' + name + ', error:\n' + e); }
    }
    return task;
};

manageCreep.prototype.cleanCreeps = function() {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            if (Memory.creeps[name].workId) {
                Game.Queue.work.removeCreep(name, Memory.creeps[name].workId);
            }
            if (C.DEBUG >= 2) { console.log('DEBUG - clearing non-existant creep memory name: ' + name + ' role: ' + Memory.creeps[name].role); }
            delete Memory.creeps[name];
        }
    }

    return true;
};

manageCreep.prototype.doManage = function() {
    this.cleanCreeps();

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (!creep.memory.role || creep.spawning) { continue; }
        if (creep.isDespawnWarning()) {
            this.doDespawn(creep);
            continue;
        }

        this.doRole(creep);
    }

};

manageCreep.prototype.doDespawn = function(creep) {
    if (!creep) { return false; }

    if (!creep.memory.despawn || creep.memory.despawn == undefined) {
        creep.setDespawn();
    }

    if (creep.getOffExit()) { return true; }
    if (creep.memory.spawnRoom && creep.room.name != creep.memory.spawnRoom) {
        creep.moveToRoom(creep.memory.spawnRoom);
        return true;
    }

	if (!creep.room.getSpawn()) { return false; }

    if (creep.room.getDespawnContainer()) {
        creep.memory.goingTo = creep.room.getDespawnContainer();
    }

    if (!creep.memory.goingTo) {
        this.getDespawnContainer(creep);
    } else {
        this.doDespawnOnContainer(creep);
    }

    return true;
};

manageCreep.prototype.doDespawnOnContainer = function(creep) {
    if (!creep) { return false; }

    let target = Game.getObjectById(creep.memory.goingTo);
    if (!target) {
        creep.memory.goingTo = false;
        return false;
    }

    if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
        if (creep.room.memory.deSpawnContainerId && creep.room.memory.spawnId) {
            if (C.DEBUG >= 1) { console.log("INFO - recycling " + creep.memory.role + " " + creep.name); }
            let roomSpawn = Game.getObjectById(creep.room.getSpawn());
            roomSpawn.recycleCreep(creep);
        } else {
            creep.suicide();
        }
    }

    creep.moveTo(target.pos.x, target.pos.y);

    return true;
};

manageCreep.prototype.getDespawnContainer = function(creep) {
    if (!creep) { return false; }

    let targets = creep.room.getContainers();
    if (targets.length == 0) {
        creep.suicide();

        return false;
    }
    targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));

    return creep.setGoingTo(targets[0]);
};

module.exports = manageCreep;
