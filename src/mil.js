/*
 * Mil system
 *
 * mil provides combat funtion
 *
 */

var Defense     = require('mil.defense');
var Squad       = require('mil.squad');
var milCreep    = require('mil.creep');

var Mil = function() {
    this.defense    = new Defense;
    this.squad      = new Squad;
    this.creep      = new milCreep;

    Memory.world = Memory.world || {};
    Memory.world.mil = Memory.world.mil || {}
    this.memory = Memory.world.mil;
};

Mil.prototype.run = function() {

    if (Game.cpu.bucket < C.CPU_MIN_BUCKET_MIL) { return true; }

    return true;
};

Mil.prototype.doSquads = function() {

    if (Game.cpu.bucket < C.CPU_MIN_BUCKET_SQUAD) { return true; }

    let queue = Game.Queue.mil.getQueue();

    if (queue.length <= 0) { return false; }

    for (let s = 0; s < queue.length; s++) {
        this.doSquad(queue[s]);
    }

    return true;
}

Mil.prototype.doRoom = function(room) {
    if (!room) { return ERR_INVALID_ARGS; }

    return true;
};

Mil.prototype.doFlag = function(flag) {
    if (!flag) { return ERR_INVALID_ARGS; }

    let flagName = flag.name;
    let args = flagName.split(':');

    if (!Game.Queue.mil.isQueued({ squad:args[0] })) {
        let record = {
            squad: args[0],
        };

        if (!Game.Queue.mil.addRecord(record)) {
            return false;
        }
    }

    switch (flag.secondaryColor) {
        case COLOR_RED:
            this.squad.updateRally(flag);
            break;
        case COLOR_PURPLE:
            this.squad.doSpawn(flag, {
                squad: args[0],
                role: args[1],
                count: args[2],
            });
            break;
    }

    return true;
}

Mil.prototype.isAlly = function(name) {
    if (!name) { return ERR_INVALID_ARGS; }

    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Mil.prototype.isEnemy = function(name) {
    if (!name) { return ERR_INVALID_ARGS; }

    Memory.world.enemys = Memory.world.enemys || [];
    let enemies = Memory.world.enemys;

    if (enemys.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Mil.prototype.addAlly = function(name) {
    if (!name) { return ERR_INVALID_ARGS; }

    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    allies.push(name.toLowerCase());
    return true;
};

Mil.prototype.addEnemy = function(name) {
    if (!name) { return ERR_INVALID_ARGS; }

    Memory.world.enemys = Memory.world.enemys || [];
    let enemys = Memory.world.enemys;

    if (enemys.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    enemys.push(name.toLowerCase());
    return true;
};

module.exports = Mil;
