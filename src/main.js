/*
 * Main Loop
 *
 * Main control function
 *
 */

// prototypes
require('prototype.memory');
require('prototype.creep');
require('prototype.source');
require('prototype.room');
require('prototype.structureContainer');
require('prototype.roomPosition');

// global methods
global.Constant     = require('constants');
global.cli          = require('cli');

// load the queue systems
var Queues          = require('queues');
var spawnQueue      = require('queue.spawn');
var workQueue       = require('queue.work');

// managment modules
var manageRooms     = require('manage.rooms');
var manageRole      = require('manage.role');
var manageCreep     = require('manage.creep');

module.exports.loop = function () {
    Memory.world = Memory.world || {};

    Game.Queues = new Queues;
    Game.Queues.spawn = new spawnQueue;
    Game.Queues.work = new workQueue;

    manageCreep.init();
    Game.Queues.work.doManageTasks();
    manageRooms.doManage();

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (!creep.memory.role || creep.spawning) { continue; }

        if (creep.isDespawnWarning()) {
            manageCreep.doDespawn(creep);
            continue;
        }

        manageRole.doRole(creep);
    }

}
