/*
 * Mil system
 *
 * mil provides combat funtion
 *
 */

var Defense = require('mil.defense');

var Mil = function() {
    this.defense = new Defense;

    this.brawlerCount = 1;
};

Mil.prototype.spawnMilitia = function(room) {
    if (!room) { return -1; }

    // spawn brawlers for the militia
    let count = _.filter(Game.creeps, creep =>
        creep.memory.spawnRoom == room.Name &&
        creep.memory.role == 'combat.brawler' &&
        creep.memory.combatGroup == 'militia' &&
        creep.memory.despawn != true
        ).length;
    if (count < this.brawlerCount) {
        if (!Game.Queue.spawn.isQueued({ room: task.spawnRoom, role: 'tech', })) {
            let record = {
                rooms: [ task.spawnRoom, ],
                role: 'combat.brawler',
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
