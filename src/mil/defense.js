/*
 * Defense system
 *
 * defense provides monitoring of rooms for invaders (npc or player)
 * and respondes to the threats
 *
 */

var Defense = function() {
    this.status = 'clear';
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
    if (Game.Queue.work.isQueued({ task: 'defense', room: room.name, })) {
        return true;
    }

    let record = {
        workRooms: [ room.name, ],
        task: 'defense',
        managed: true,
        priority: 10,
        creepLimit: 1,
    };
    Game.Queue.work.addRecord(record);

    return true;
};

module.exports = Defense;
