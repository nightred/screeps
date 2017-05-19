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
    Memory.world.mil = Memory.world.mil || {}
    this.memory = Memory.world.mil;
};

Mil.prototype.doRoom = function(room) {
    if (!room) { return -1; }

    if (Game.cpu.bucket < 1000) { return true; }

    this.spawnMilitia(room);

    return true;
};

Mil.prototype.doFlag = function(flag) {
    if (!flag) { return -1; }

    if (!Game.Queue.mil.getSquad(flag.name)) {
        let record = {
            squad: flag.name,
            opRoon: flag.room.name,
        };
        Game.Queue.mil.addRecord(record);
    }

    let squad = Game.Queue.mil.getSquad(flag.name);
    if (!squad) {
        return false;
    }

    squad.opRoom = flag.room.name != squad.opRoom ? flag.room.name : squad.opRoom;
    squad.opRoomRallyX = flag.pos.x != squad.opRoomRallyX ? flag.pos.x : squad.opRoomRallyX;
    squad.opRoomRallyY = flag.pos.y != squad.opRoomRallyY ? flag.pos.y : squad.opRoomRallyY;

    return true;
}

Mil.prototype.spawnMilitia = function(room) {
    if (!room) { return -1; }

    let brawlerCount = 0;
    switch (room.controller.level) {
        case 1:
            break;
        case 2:
        case 3:
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

module.exports = Mil;
