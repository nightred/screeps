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
var SpawnQueue      = require('queue.spawn');
var WorkQueue       = require('queue.work');
var EnergyNet       = require('energy.net')

// managment modules
var manageRooms     = require('manage.rooms');
var manageCreep     = require('manage.creep');

module.exports.loop = function () {
    Memory.world = Memory.world || {};

    Game.Queues         = new Queues;
    Game.Queues.spawn   = new SpawnQueue;
    Game.Queues.work    = new WorkQueue;
    Game.energyNet      = new EnergyNet;

    Game.Queues.work.doManageTasks();
    manageRooms.doManage();
    manageCreep.doManage();

}
