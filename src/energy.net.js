/*
 * Energy Net system
 *
 * energy net records the energy needs of a room
 * provides storage and provider locations for energy
 *
 */

var EnergyNet = function() {
    this.tick = this.tick || 0;
    if (this.tick < Game.time) {
        this.rooms = {};
        this.tick = Game.time;
    }
};



module.exports = EnergyNet;
