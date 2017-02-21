/*
 * Main Loop
 *
 * Main control function
 *
 */

// prototypes
require('prototype.memory');
require('prototype.creep');
require('prototype.spawn');
require('prototype.source');
require('prototype.room');
require('prototype.structureContainer');

// global methods
global.Constant     = require('constants');
global.Work         = require('manage.work');
global.QSpawn       = require('manage.spawnQueue');

// managment modules
var manageMemory    = require('manage.memory');
var manageRole      = require('manage.role');
var manageCreep     = require('manage.creep');
var manageTower     = require('manage.tower');

// third party modules
var Traveler        = require('traveler');

module.exports.loop = function () {
    
    if (!Constant.ACTIVE) {
        return false;
    }
    
    Work.init();
    QSpawn.init();
    manageCreep.init();

    for (let name in Game.rooms) {
        if (Game.rooms[name].controller.my) {
            let room = Game.rooms[name];
            manageMemory.run(room);
            manageRole.run(room);
            manageTower.run(room);
            Work.createWork.run(room);
            QSpawn.run(room);
        }
    }

    QSpawn.doManage();
    Work.doManage();

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        
        if (!creep.memory.role || creep.memory.role == undefined || creep.spawning) {
            continue;
        }
        
        if (creep.isDespawnWarning()) {
            manageCreep.doDespawn(creep);
            continue;
        }
        
        manageRole.doRole(creep);
    }
    
    Memory.world.reportTime = Memory.world.reportTime || Game.time;
    if ((Memory.world.reportTime + Constant.REPORT_TICKS) < Game.time) {
        console.log('REPORT - game tick: ' + Game.time);
        console.log('╔═══════════════════════════════════════════════════════');
        Work.getReport();
        console.log('╠═══════════════════════════════════════════════════════');
        QSpawn.getReport();
        console.log('╚═══════════════════════════════════════════════════════');
        
        Memory.world.reportTime = Game.time;
    }
    
}
