/*
 * manage Market systems
 *
 */

var logger = new Logger('[Market Manager]');

var MarketManager = function() {
    // init
};

/**
* @param {Room} room The room
**/
MarketManager.prototype.run = function() {
    let room = Game.rooms[this.memory.roomName];
    if (room) {
        // run
    }
};


registerProcess('managers/market', MarketManager);
