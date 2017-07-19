/*
 * Room managment
 *
 * runs proccesses to manage each room
 *
 */

// managment modules
var Tower           = require('manage.room.tower');
var Storage         = require('manage.room.storage');
var Link            = require('manage.room.link');
var Spawn           = require('manage.room.spawn');

var manageRoom = function() {
    this.storage        = new Storage;
    this.link           = new Link;
    this.tower          = new Tower;
    this.spawn          = new Spawn;
};


manageRoom.prototype.run = function() {
    for (let name in Game.rooms) {
        let room = Game.rooms[name];

        // clean memory
        this.gcContainers(room);
        this.gcTowers(room);
        this.gcLinks(room);

        // defense routine
        Game.Mil.defense.doRoom(room);

        // controller room processes
        if (room.controller && room.controller.my) {
            this.link.doRoom(room);
            Game.Mil.doRoom(room);
            this.spawn.doRoom(room);
            this.tower.doRoom(room);
        }
    }

    return true;
};

manageRoom.prototype.gcContainers = function(room) {
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

manageRoom.prototype.gcTowers = function(room) {
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

manageRoom.prototype.gcLinks = function(room) {
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

module.exports = manageRoom;
