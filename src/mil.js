/*
 * Mil system
 *
 * mil provides combat funtion
 *
 */

var Defense = require('mil.defense');

var Mil = function() {
    this.defense = new Defense;

};

Mil.prototype.spawnMilitia = function(room) {
    if (!room) { return -1; }

    let brawlerCount = 0;
    switch (room.controller.level) {
        case 1:
            break;
        case 2:
        case 3:
            brawlerCount = 1;
            break;
        case 4:
        case 5:
        case 6:
            brawlerCount = 2;
            break;
        case 7:
        case 8:
            brawlerCount = 3;
            break;
    }

    // spawn brawlers for the militia
    let count = _.filter(Game.creeps, creep =>
        creep.memory.spawnRoom == room.name &&
        creep.memory.role == C.COMBAT_BRAWLER &&
        creep.memory.combatGroup == 'militia' &&
        creep.memory.despawn != true
        ).length;
    if (count < brawlerCount) {
        if (!Game.Queue.spawn.isQueued({ room: room.name, role: C.COMBAT_BRAWLER, })) {
            let record = {
                rooms: [ room.name, ],
                role: C.COMBAT_BRAWLER,
                priority: 38,
                creepArgs: {
                    combatGroup: 'militia',
                },
            };
            Game.Queue.spawn.addRecord(record);
        }
    }
};

module.exports = Mil;
