/*
 * Mil system
 *
 * mil provides combat funtion
 *
 */

var Squad       = require('mil.squad');
var milCreep    = require('mil.creep');

var Mil = function() {
    this.squad      = new Squad;
    this.creep      = new milCreep;

    Memory.world = Memory.world || {};
    Memory.world.mil = Memory.world.mil || {}
    this.memory = Memory.world.mil;
};

Mil.prototype.run = function() {
    if (Game.cpu.bucket < C.CPU_MIN_BUCKET_MIL) { return true; }

    let cpuStart = Game.cpu.getUsed();

    let log = {
        command: 'military',
    };

    this.doSquads();

    log.status = 'OK';
    log.cpu = Game.cpu.getUsed() - cpuStart;

    addTerminalLog(undefined, log)
};

Mil.prototype.doSquads = function() {
    if (Game.cpu.bucket < C.CPU_MIN_BUCKET_SQUAD) { return true; }

    let queue = Game.Queue.mil.getQueue();

    if (queue.length <= 0) { return false; }

    for (let s = 0; s < queue.length; s++) {
        this.squad.doSquad(queue[s]);
    }

    return true;
}

Mil.prototype.doFlag = function(flag) {
    if (!flag) { return ERR_INVALID_ARGS; }

    let flagName = flag.name;
    let args = flagName.split(':');

    if (flag.memory.squadId && !getQueueRecord(flag.memory.squadId)) {
        flag.memory.squadId = undefined;
    }

    if (!flag.memory.squadId) {
        let squadId = undefined;

        if (Game.Queue.mil.getSquad(args[0])) {
            squadId = Game.Queue.mil.getSquad(args[0]).id;
        }

        if (!squadId) {
            squadId = Game.Queue.mil.addRecord({
                squad: args[0],
            });
        }

        flag.memory.squadId = squadId;
    }

    switch (flag.secondaryColor) {
        case COLOR_RED:
            this.squad.doTarget(flag);
            break;
        case COLOR_PURPLE:
            this.squad.doSpawn(flag, {
                squad: args[0],
                role: 'combat.' + args[1],
                count: args[2],
            });
            break;
    }

    return true;
}

module.exports = Mil;
