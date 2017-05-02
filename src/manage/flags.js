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
        if (flag.memory.init && flag.color != COLOR_RED) { continue; }

        let result = false;
        switch (flag.color) {
            case COLOR_RED:
                Game.Mil.doFlag(flag);
                break;
            case COLOR_GREEN:
                result = Game.Queue.work.doFlag(flag);
                break;
        }

        if (flag.color != COLOR_RED) {
            flag.name += result ? ':' + result : ':error';
            flag.memory.init = 1;
        }

        return true;
    }
};

module.exports = Flags;
