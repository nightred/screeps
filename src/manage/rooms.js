/*
 * Rooms managment
 *
 * runs proccesses to manage each room
 *
 */

// managment modules
var manageTower     = require('manage.room.tower');
var EnergyGrid      = require('manage.room.energyGrid');
var Link            = require('manage.room.link');

var manageRooms = function() {
    this.energyGrid     = new EnergyGrid;
    this.link           = new Link;
    this.tower          = manageTower;
};


manageRooms.prototype.doManage = function() {
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        this.doContainers(room);
        this.doTowers(room);
        this.doLinks(room);
        Game.Mil.defense.doRoom(room);
        if (room.controller && room.controller.my) {
            this.link.doRoom(room);
            Game.Mil.doRoom(room);
            Game.Queue.work.doTaskFind(room);
            Game.Queue.spawn.doSpawn(room);
            this.tower.doRoom(room);
        }
    }

    return true;
};

manageRooms.prototype.doContainers = function(room) {
    if (!room) {return false; }

    room.memory.containersMemory = room.memory.containersMemory || 0;
    if ((room.memory.containersMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.containersMemory = Game.time;

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

    return true;
};

manageRooms.prototype.doTowers = function(room) {
    if (!room) {return false; }

    room.memory.towersMemory = room.memory.towersMemory || 0;
    if ((room.memory.towersMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.towersMemory = Game.time;

    for (let towerId in room.memory.structureTowers) {
        if (!Game.getObjectById(towerId)) {
            delete room.memory.structureTowers[towerId];
            if (C.DEBUG >= 1) { console.log('INFO - clearing non-existant tower: ' + towerId); }
        }
    }

    return true;
};

manageRooms.prototype.doLinks = function(room) {
    if (!room) {return false; }

    room.memory.linksMemory = room.memory.linksMemory || 0;
    if ((room.memory.linksMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.linksMemory = Game.time;

    for (let linkId in room.memory.structureLinks) {
        if (!Game.getObjectById(linkId)) {
            delete room.memory.structureLinks[linkId];
            if (C.DEBUG >= 1) { console.log('INFO - clearing non-existant link: ' + linkId); }
        }
    }

    return true;
};

module.exports = manageRooms;
