/*
 * flags system
 *
 * flags provides interaction controls
 *
 */

var Flags = function() {
    // init
    Memory.flags = Memory.flags || {}
    this.memory = Memory.flags;
};

Flags.prototype.run = function() {
	if (Game.cpu.bucket < C.CPU_MIN_BUCKET_FLAGS) { return true; }

    let cpuStart = Game.cpu.getUsed();

    let log = {
        command: 'flag managment',
    };

    this.gc();

    for (let name in Game.flags) {
        let flag = Game.flags[name];

        switch (flag.color) {
        case COLOR_RED:
            Game.Mil.doFlag(flag);
            break;
        case COLOR_GREEN:
            Game.Work.doFlag(flag);
            break;
        case COLOR_YELLOW:
            Game.Director.doFlag(flag);
            break;
        }
    }

    log.status = 'OK';
    log.cpu = Game.cpu.getUsed() - cpuStart;

    Game.Visuals.addLog(undefined, log)
};

Flags.prototype.gc = function() {
    for(let name in Memory.flags) {
        if(!Game.flags[name]) {
            if (Memory.flags[name].workId) {
                Game.Queue.delRecord(Memory.flags[name].jobId);
            }

            if (C.DEBUG >= 2) { console.log('DEBUG - clearing non-existant flag memory name: ' + name); }

            delete Memory.flags[name];
        }
    }

    return true;
};

module.exports = Flags;
