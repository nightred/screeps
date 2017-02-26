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
global.Work         = require('manage.work');
global.QSpawn       = require('manage.spawnQueue');

// managment modules
var manageMemory    = require('manage.memory');
var manageRole      = require('manage.role');
var manageCreep     = require('manage.creep');
var manageTower     = require('manage.tower');

module.exports.loop = function () {

    if (!Constant.ACTIVE) {
        return false;
    }
    
    Work.init();
    QSpawn.init();
    manageCreep.init();

    for (let name in Game.rooms) {
        if (!Game.rooms[name].controller) { continue; }
        if (Game.rooms[name].controller.my) {
            let room = Game.rooms[name];
            manageMemory.run(room);
            manageTower.run(room);
            Work.createWork.run(room);
            QSpawn.run(room);
        }
    }

    QSpawn.doManage();
    Work.doManage();

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];

        if (!creep.memory.role || creep.spawning) {
            continue;
        }

        if (creep.isDespawnWarning()) {
            manageCreep.doDespawn(creep);
            continue;
        }

        manageRole.doRole(creep);
    }
    Memory.world = Memory.world || {};
    Memory.world.reportTime = Memory.world.reportTime || 0;
    if ((Memory.world.reportTime + Constant.REPORT_TICKS) < Game.time) {
        Memory.world.reportTime = Game.time;
        cli.report.run();
    }

}
