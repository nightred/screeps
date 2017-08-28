/*
 * Utility Functions.
 *
 */

require('util.visuals');
require('util.storage');

global.setSleep = function(obj, ticks) {
    if (!obj.memory) return;
    obj.memory.sleep = Game.time + ticks;
}

global.isSleep = function(obj) {
    return (!obj.memory || !obj.memory.sleep || obj.memory.sleep < Game.time) ? false : true;
}
