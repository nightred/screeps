/*
 * flag service
 *
 * provides interaction controls through flags
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Service Flag]');
logger.level = C.LOGLEVEL.DEBUG;

var Flag = function() {
    // init
    Memory.flags = Memory.flags || {}
    this.memory = Memory.flags;
};

Flag.prototype.run = function() {
	if (Game.cpu.bucket < C.CPU_MIN_BUCKET_FLAGS) { return true; }

    let cpuStart = Game.cpu.getUsed();

    this.gc();

    for (let name in Game.flags) {
        let flag = Game.flags[name];

        switch (flag.color) {
        case COLOR_RED:
            Game.Mil.doFlag(flag);
            break;

        case COLOR_GREEN:
            doFlagWork(flag);
            break;

        case COLOR_YELLOW:
            Game.Director.doFlag(flag);
            break;

        case COLOR_ORANGE:
            doFlagVisuals(flag);
            break;
        }
    }

    addTerminalLog(undefined, {
        command: 'service flag',
        status: 'OK'
        cpu: (Game.cpu.getUsed() - cpuStart),
    })
};

Flag.prototype.gc = function() {
    for(let name in Memory.flags) {
        if(!Game.flags[name]) {
            if (Memory.flags[name].workId) {
                Game.Queue.delRecord(Memory.flags[name].jobId);
            }

            logger.debug('clearing non-existant flag memory name: ' + name);

            delete Memory.flags[name];
        }
    }

    return true;
};

registerProcess('services/flag', Flag);
