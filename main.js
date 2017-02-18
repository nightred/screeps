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

    let rooms = [];
    for (let name in Game.rooms) {
        if (Game.rooms[name].controller.my) {
            rooms.push(Game.rooms[name]);
        }
    }
    
    rooms.forEach((room) => manageMemory.run(room));
    rooms.forEach((room) => manageTower.run(room));
    rooms.forEach((room) => manageCreep.run(manageRole, room));
    
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        
        if (creep.memory.role == '' || creep.memory.role == undefined || creep.spawning) {
            continue;
        }
        
        if (creep.isDespawnWarning()) {
            manageCreep.doDeSpawn(creep);
            continue;
        }
        
        manageRole[creep.memory.role].run(creep);
    }
    
}
