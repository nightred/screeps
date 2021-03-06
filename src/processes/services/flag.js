/*
 * flag service
 *
 * provides interaction controls through flags
 *
 */

var logger = new Logger('[Service Flag]');

var Flag = function() {
    // init
    Memory.flags = Memory.flags || {}
    this.memory = Memory.flags;
};

Flag.prototype.run = function() {
	this.cleanupFlags();

    for (const name in Game.flags) {
        let flag = Game.flags[name];

        switch (flag.color) {
        case COLOR_RED:
            //Game.Mil.doFlag(flag);
            break;

        case COLOR_GREEN:
            doFlagWork(flag);
            break;

        case COLOR_YELLOW:
            this.doDirectorFlag(flag);
            break;

        case COLOR_ORANGE:
            Game.drvDisplay.doFlag(flag);
            break;
        }
    }
};

Flag.prototype.doDirectorFlag = function(flag) {
    if (!flag.memory.init) {
        let flagVars = flag.name.split(':');
        let roomName = flag.pos.roomName;

        if (!C.DIRECTOR_FLAG_MAP[flagVars[1]]) {
            logger.alert('invalid director type requested by flag: ' + flag.name);
            flag.memory.result = 'invalid director';
            return;
        }

        let imageName = C.DIRECTOR_FLAG_MAP[flagVars[1]];
        let process = Game.kernel.startProcess(this, imageName, {});
        process.flag(roomName, flagVars);
        Game.kernel.setParent(process.pid);

        flag.memory.pid = process.pid;
        flag.memory.init = 1;
    }
};

Flag.prototype.cleanupFlags = function() {
    for(let name in Memory.flags) {
        if(!Game.flags[name]) {
            if (Memory.flags[name].workId)
                delQueueRecord(Memory.flags[name].jobId);

            logger.debug('clearing non-existant flag memory name: ' + name);
            delete Memory.flags[name];
        }
    }
};

registerProcess('services/flag', Flag);
