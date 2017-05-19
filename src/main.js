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
require('prototype.mineral');
require('prototype.room');
require('prototype.structureContainer');
require('prototype.structureStorage');
require('prototype.roomPosition');

// global methods
global.C            = require('constants');
global.cli          = require('cli');

// load the queue systems
var Stats           = require('stats');
var Queue           = require('queue');
var Manage          = require('manage');
var Mil             = require('mil');

module.exports.loop = function () {
    Game.Stats          = new Stats;
    Game.Queue          = new Queue;
    Game.Manage         = new Manage;
    Game.Mil            = new Mil;

    Game.Queue.run();
    Game.Manage.run();
    Game.Stats.run();
}
