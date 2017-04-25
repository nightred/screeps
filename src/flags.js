/*
 * flags system
 *
 * flags provides interaction controls
 *
 */

var Flags = function() {
    Memory.world = Memory.world || {};
    Memory.world.flags = Memory.world.flags || {}
    this.memory = Memory.world.flags;
};

Flags.prototype.doRoom = function(room) {
    if (!room) { return -1; }

    return true;
};

module.exports = Flags;
