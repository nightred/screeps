/*
 * Defense system
 *
 * defense provides monitoring of rooms for invaders (npc or player)
 * and respondes to the threats
 *
 */

var Defense = function() {
    Memory.world.mil = Memory.world.mil || {}
    Memory.world.mil.allies = Memory.world.mil.allies || {}
    this.memory = Memory.world.mil;
};

Defense.prototype.manage = function(room) {
    if (!room) { return -1; }

    room.memory.findTickDefense = room.memory.findTickDefense || 0;
    if ((room.memory.findTickDefense + C.FIND_WAIT_TICKS) > Game.time) {
        return true;
    }
    room.memory.findTickDefense = Game.time;

    let targets = room.getHostiles();
    if (targets.length <= 0) { return true; }
    for (let i = 0; i < targets.length; i++) {
        //
    }
    if (Game.Queue.work.isQueued({ task: C.DEFENSE, room: room.name, })) {
        return true;
    }

    let record = {
        workRooms: [ room.name, ],
        task: C.DEFENSE,
        managed: true,
        priority: 10,
        creepLimit: 1,
    };
    Game.Queue.work.addRecord(record);

    return true;
};

module.exports = Defense;
