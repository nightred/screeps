/*
 * flags system
 *
 * flags provides interaction controls
 *
 */

var Flags = function() {
    Memory.flags = Memory.flags || {}
    this.memory = Memory.flags;
};

Flags.prototype.doRoom = function(room) {
    if (!room) { return -1; }

    return true;
};

Flags.prototype.doManage = function() {
    for (let name in Game.flags) {
        let flag = Game.flags[name];

        switch (flag.color) {
            case COLOR_RED:
                // mil flag
                break;
            case COLOR_GREEN:
                Game.Queue.work.doFlag(flag);
                break;
        }
    }
};

module.exports = Flags;
