/*
 * Room managment
 *
 * runs proccesses to manage each room
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Manage Rooms]');
logger.level = C.LOGLEVEL.DEBUG;

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
    let cpuStart = Game.cpu.getUsed();

    let rCount = 0;

    for (let name in Game.rooms) {
        let room = Game.rooms[name];

        this.runRoom(room);

        rCount++;
    }

    let log = {
        command: 'room managment',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    };
    log.output = 'room count: ' + rCount +
        ' avg cpu: ' + (log.cpu / rCount).toFixed(2);
    Game.Visuals.addLog(undefined, log)
};

manageRoom.prototype.runRoom = function(room) {
    let cpuStart = Game.cpu.getUsed();

    let log = { command: 'manage', };

    // clean memory
    this.gcContainers(room);
    this.gcTowers(room);
    this.gcLinks(room);

    // controller room processes
    if (room.controller && room.controller.my) {
        this.link.doRoom(room);
        this.spawn.doRoom(room);
        this.tower.doRoom(room);
    }

    let defense = room.memory.defense;

    if (defense && defense.active) {
        let args = {
            ticks: Game.time - defense.tick,
        };

        if (defense.cooldown) {
            args.cooldown = (defense.cooldown + C.DEFENSE_COOLDOWN) - Game.time;
        }

        Game.Visuals.addDefense(room.name, args);
    }

    log.status = 'OK';
    log.cpu = Game.cpu.getUsed() - cpuStart;

    Game.Visuals.addLog(room.name, log)
};

manageRoom.prototype.gcContainers = function(room) {
    room.memory.containersMemory = room.memory.containersMemory || 0;
    if ((room.memory.containersMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.containersMemory = Game.time;

    for (let containerId in room.memory.structureContainers) {
        if (!Game.getObjectById(containerId)) {
            delete room.memory.structureContainers[containerId];
            logger.debug('clearing non-existant container: ' + containerId);
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
    room.memory.towersMemory = room.memory.towersMemory || 0;
    if ((room.memory.towersMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.towersMemory = Game.time;

    for (let towerId in room.memory.structureTowers) {
        if (!Game.getObjectById(towerId)) {
            delete room.memory.structureTowers[towerId];
            logger.debug('clearing non-existant tower: ' + towerId);
        }
    }

    return true;
};

manageRoom.prototype.gcLinks = function(room) {
    room.memory.linksMemory = room.memory.linksMemory || 0;
    if ((room.memory.linksMemory + C.MANAGE_MEMORY_TICKS) > Game.time) {
        return true;
    }
    room.memory.linksMemory = Game.time;

    for (let linkId in room.memory.structureLinks) {
        if (!Game.getObjectById(linkId)) {
            delete room.memory.structureLinks[linkId];
            logger.debug('clearing non-existant link: ' + linkId);
        }
    }

    return true;
};

module.exports = manageRoom;
