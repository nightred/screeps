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
    this.doCheckRooms();
};

ServiceRoom.prototype.doCheckRooms = function() {
    if (this.memory.sleepCheckRooms && this.memory.sleepCheckRooms > Game.time) return;
    this.memory.sleepCheckRooms = C.SERVICE_SLEEP + Game.time;

    for (const name in Game.rooms) {
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
