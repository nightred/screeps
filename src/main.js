/*
 * Main Loop
 *
 */

// prototypes
require('prototype.prototype');

// global methods
global.C            = require('constants');
global.cli          = require('util.cli');
global.utils        = new (require('util.utils'));
global.logger       = new (require('util.logger'));

// load kernel
var Kernel = require('kernel');

// load processes
require('processes.processlist');

// modules
var Director        = require('director.director');
var Queue           = require('queue.queue');
var Manage          = require('manage.manage');
var Role            = require('role.role');
var Task            = require('task.task');
var Work            = require('work.work');
var Mil             = require('mil.mil');
var Visuals         = require('util.visuals');

// init the logger
var Logger = require('util.logger');

var logger = new Logger('[Main]');
logger.level = C.LOGLEVEL.DEBUG;

module.exports.loop = function () {
    let cpuStart = Game.cpu.getUsed();

    // init the kernel
    Game.Kernel = new Kernel;

    // hook modules
    Game.Director       = new Director;
    Game.Queue          = new Queue;
    Game.Role           = new Role;
    Game.Task           = new Task;
    Game.Work           = new Work;
    Game.Manage         = new Manage;
    Game.Mil            = new Mil;
    Game.Visuals        = new Visuals;

    Game.Visuals.addLog(undefined, {
        command: 'init',
        status: 'OK',
        cpu: Game.cpu.getUsed(),
        output: 'memory usage: ' + (JSON.stringify(RawMemory).length / 1024).toFixed(2) + ' KB',
    });

    // start the kernel
    Game.Kernel.run();

    Game.Visuals.addLog(undefined, {
        command: 'starting main',
    });

    // run modules
    Game.Queue.run();
    Game.Manage.run();
    Game.Director.run();
    Game.Mil.run();

    Game.Visuals.addLog(undefined, {
        command: 'main',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });

    Game.Visuals.run();

}
