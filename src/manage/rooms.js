/*
 * Rooms managment
 *
 * runs proccesses to manage each room
 *
 */

// managment modules
var manageTower     = require('manage.tower');
var EnergyGrid      = require('manage.energyGrid');
var Link            = require('manage.link');

var manageRooms = function() {
    this.energyGrid     = new EnergyGrid;
    this.link           = new Link;
    this.tower          = manageTower;
};


manageRooms.prototype.doManage = function() {
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        this.doContainers(room);
        if (room.controller &&
            (room.controller.my ||
            (room.controller.reservation &&
            room.controller.reservation.username == 'nightred'))) {
            Game.Mil.defense.manage(room)
        }
        if (room.controller && room.controller.my) {
            this.link.manage(room);
            Game.Mil.spawnMilitia(room);
            Game.Queue.work.doTaskFind(room);
            Game.Queue.spawn.doSpawn(room);
            this.tower.run(room);
        }
    }

    return true;
};

manageRooms.prototype.doContainers = function(room) {
    if (!room) {return false; }

    if (room.memory.containersMemory < (Game.time - 20) || !room.memory.containersMemory) {
        for (let containerId in room.memory.structureContainers) {
            if (!Game.getObjectById(containerId)) {
                delete room.memory.structureContainers[containerId];
                if (C.DEBUG >= 1) { console.log('INFO - clearing non-existant container: ' + containerId); }
            }
        }

        var targets = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER;
            }
        });

        for (let target of targets) {
            if (!target.memory.type) {
                target.memory.type = 'default';
            }
        }

        room.memory.containersMemory = Game.time;
    }
};

module.exports = manageRooms;
