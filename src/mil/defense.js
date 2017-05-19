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

    if (!room.controller || (room.controller &&
        ((!room.controller.my && room.controller.owner) ||
        (room.controller.reservation &&
        !room.controller.reservation.username == C.USERNAME)))) {
        return true;
    }

    room.memory.findTickDefense = room.memory.findTickDefense || 0;
    if ((room.memory.findTickDefense + C.FIND_WAIT_TICKS) > Game.time) {
        return true;
    }
    room.memory.findTickDefense = Game.time;

    let targets = room.getHostiles();
    if (targets.length <= 0) { return true; }
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
