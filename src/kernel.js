/*
 * Kernel
 *
 * main kernel of the system
 */

var Director        = require('director.director');
var Queue           = require('queue.queue');
var Manage          = require('manage.manage');
var Role            = require('role.role');
var Task            = require('task.task');
var Work            = require('work.work');
var Mil             = require('mil.mil');
var Visuals         = require('util.visuals');

var Kernel = function() {
    Game.Director       = new Director;
    Game.Queue          = new Queue;
    Game.Role           = new Role;
    Game.Task           = new Task;
    Game.Work           = new Work;
    Game.Manage         = new Manage;
    Game.Mil            = new Mil;
    Game.Visuals        = new Visuals;
};

Kernel.prototype.run = function() {
    Game.Visuals.addLog(undefined, { command: 'init', status: 'OK', cpu: Game.cpu.getUsed(), })

    let cpuStart = Game.cpu.getUsed();

    Game.Queue.run();
    Game.Manage.run();
    Game.Director.run();
    Game.Mil.run();

    Game.Visuals.addLog(undefined, {
        command: 'kernel',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
    });

    Game.Visuals.run();
};

module.exports = Kernel;
