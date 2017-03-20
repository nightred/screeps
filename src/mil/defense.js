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

Defense.prototype.scanRoom = function(room) {
    if (!room) { return -1; }

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
        creepLimit: 0,
    };
    Game.Queue.work.addRecord(record);

    return true;
};

module.exports = Defense;
