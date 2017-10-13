/*
 * Room Manager service
 *
 * runs proccesses to manage each room
 *
 */

var logger = new Logger('[Service Room]');

var ServiceRoom = function() {
    // init
};

Object.defineProperty(ServiceRoom.prototype, 'processTable', {
    get: function() {
        this.memory.processTable = this.memory.processTable || {};
        return this.memory.processTable;
    },
    set: function(value) {
        this.memory.processTable = this.memory.processTable || {};
        this.memory.processTable = value;
    },
});

ServiceRoom.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    let count = Object.keys(Game.rooms).length;

    this.doCheckRooms();

    addTerminalLog(undefined, {
        command: 'service room',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
        output: ('room count: ' + count),
    });
};

ServiceRoom.prototype.doCheckRooms = function() {
    if (this.memory.sleepCheckRooms && this.memory.sleepCheckRooms > Game.time) return;
    this.memory.sleepCheckRooms = C.SERVICE_SLEEP + Game.time;

    for (let name in Game.rooms) {
        if (!this.processTable[name] ||
            !Game.kernel.getProcessByPid(this.processTable[name])
        ) {
            let process = Game.kernel.startProcess(this, 'managers/room', {
                roomName: name,
            });

            if (!Memory.rooms[name]) Memory.rooms[name] = {};
            Memory.rooms[name].pid = process.pid;
            this.processTable[name] = process.pid;
        }
    }
};

registerProcess('services/room', ServiceRoom);
