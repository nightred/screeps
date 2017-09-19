/*
 * manage Market systems
 *
 */

var logger = new Logger('[Market Manager]');
logger.level = C.LOGLEVEL.DEBUG;

var MarketManager = function() {
    // init
};

/**
* @param {Room} room The room
**/
MarketManager.prototype.run = function() {
    let cpuStart = Game.cpu.getUsed();

    let room = Game.rooms[this.memory.roomName];
    if (room) {
        // run
    }

    addTerminalLog(room.name, {
        command: 'market',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    })
};


registerProcess('managers/market', MarketManager);
