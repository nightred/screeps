/*
 * Room Manager service
 *
 * runs proccesses to manage each room
 *
 */

var logger = new Logger('[Service Room]');
logger.level = C.LOGLEVEL.DEBUG;

var Room = function() {
    // init
};

Object.defineProperty(Kernel.prototype, 'processTable', {
    get: function() {
        this.memory.processTable = this.memory.processTable || {};
        return this.memory.processTable;
    },
    set: function(value) {
        this.memory.processTable = this.memory.processTable || {};
        this.memory.processTable = value;
    },
});

Room.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    for (let name in Game.rooms) {
        if (!this.processTable[name] ||
            !Game.kernel.getProcessByPid(this.processTable[name])) {
            let process = Game.kernel.startProcess(this, 'managers/room', {
                roomName: name,
            });

            Memory.rooms[name].pid = process.pid;
            this.processTable[name] = process.pid;
        }
    }

    addTerminalLog(undefined, {
        command: 'service room',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });
};

registerProcess('services/room', Room);
