/*
 * Main Loop
 *
 * Main control function
 *
 */

require('prototype.memory');
require('prototype.creep');
require('prototype.spawn');
require('prototype.source');
require('prototype.room');
require('prototype.structureContainer');

global.Constant = require('constants');
global.cacheFind = require('cache.find');

var manageMemory = require('manage.memory');
var manageRole = require('manage.role');
var manageCreep = require('manage.creep');
var manageTower = require('manage.tower');

module.exports.loop = function () {
    
    if (!Constant.ACTIVE) {
        return false;
    }
    
    let rooms = [];
    for (let name in Game.rooms) {
        if (Game.rooms[name].controller.my) {
            rooms.push(Game.rooms[name]);
        }
    }
    
    rooms.forEach((room) => manageMemory.run(room));
    rooms.forEach((room) => manageTower.run(room));
    rooms.forEach((room) => manageCreep.spawn(manageRole, room));
    
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