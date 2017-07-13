/*
 * flags system
 *
 * flags provides interaction controls
 *
 */

var Flags = function() {
    // init
    Memory.flags = Memory.flags || {}
    this.memory = Memory.flags;
};

Flags.prototype.doRoom = function(room) {
    if (!room) { return ERR_INVALID_ARGS; }

    return true;
};

Flags.prototype.doManage = function() {

    if (Game.cpu.bucket < C.CPU_MIN_BUCKET_FLAGS) { return true; }

    this.gc();

    for (let name in Game.flags) {
        let flag = Game.flags[name];

        switch (flag.color) {
            case COLOR_RED:
                Game.Mil.doFlag(flag);
                break;
            case COLOR_GREEN:
                Game.Manage.task.doFlag(flag);
                break;
        }
    }

    return true;
};

Flags.prototype.gc = function() {
    for(let name in Memory.flags) {
        if(!Game.flags[name]) {
            if (Memory.flags[name].withFlag && Memory.flags[name].jobId) {
                Game.Queue.delRecord(Memory.flags[name].jobId);
            }

            if (C.DEBUG >= 2) { console.log('DEBUG - clearing non-existant flag memory name: ' + name); }

            delete Memory.flags[name];
        }
    }

    return true;
};

module.exports = Flags;
