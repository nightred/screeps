/*
 * Mil system
 *
 * mil provides combat funtion
 *
 */

var Defense = require('mil.defense');

var Mil = function() {
    this.defense = new Defense;

    Memory.world = Memory.world || {};
};

Mil.prototype.spawnMilitia = function(room) {
    if (!room) { return -1; }

    let brawlerCount = 0;
    switch (room.controller.level) {
        case 1:
        case 2:
        case 3:
            break;
        case 4:
        case 5:
            brawlerCount = 1;
            break;
        case 6:
        case 7:
        case 8:
            brawlerCount = 2;
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

Mil.prototype.isAlly = function(name) {
    if (!name) { return -1; }

    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Mil.prototype.isEnemy = function(name) {
    if (!name) { return -1; }

    Memory.world.enemys = Memory.world.enemys || [];
    let enemies = Memory.world.enemys;

    if (enemys.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Mil.prototype.addAlly = function(name) {
    if (!name) { return -1; }

    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    allies.push(name.toLowerCase());
    return true;
};

Mil.prototype.addEnemy = function(name) {
    if (!name) { return -1; }

    Memory.world.enemys = Memory.world.enemys || [];
    let enemys = Memory.world.enemys;

    if (enemys.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    enemys.push(name.toLowerCase());
    return true;
};

module.exports = Mil;
