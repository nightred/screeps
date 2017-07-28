/*
 * Main Loop
 *
 */

// prototypes
require('prototype');

// global methods
global.C            = require('constants');
global.cli          = require('util.cli');
global.utils        = require('util.utils');

var Visuals         = new (require('util.visuals'));

var Director        = require('director');
var Queue           = require('queue');
var Manage          = require('manage');
var Task            = require('task');
var Work            = require('work');
var Mil             = require('mil');

module.exports.loop = function () {
    Game.Director       = new Director;
    Game.Queue          = new Queue;
    Game.Task           = new Task;
    Game.Work           = new Work;
    Game.Manage         = new Manage;
    Game.Mil            = new Mil;

    Game.Director.run();
    Game.Queue.run();
    Game.Manage.run();
    Game.Mil.run();

    Visuals.run();
}
