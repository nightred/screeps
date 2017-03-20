/*
 * Main Loop
 *
 * the main loop of the ai
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
global.C            = require('constants');
global.cli          = require('cli');

// load the queue systems
var Queues          = require('queues');
var SpawnQueue      = require('queue.spawn');
var WorkQueue       = require('queue.work');
var EnergyGrid      = require('energyGrid');
var Defense         = require('defense');

// managment modules
var manageRooms     = require('manage.rooms');
var manageCreep     = require('manage.creep');

// logging
var stats           = require('stats');

module.exports.loop = function () {
    Memory.world = Memory.world || {};
    stats.init();

    Game.Queues         = new Queues;
    Game.Queues.spawn   = new SpawnQueue;
    Game.Queues.work    = new WorkQueue;
    Game.Defense        = new Defense;
    Game.EnergyGrid     = new EnergyGrid;

    Game.Queues.work.doManageTasks();
    manageRooms.doManage();
    manageCreep.doManage();

    stats.log();
    stats.visuals();

}
