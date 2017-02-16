require('prototype.creep');
require('prototype.spawn');

global.Constant = require('constants');

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
    
    rooms.forEach((room) => manageTower.run(room));
    rooms.forEach((room) => manageCreep.run(manageRole, room));
    
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        
        if (creep.memory.role == '' || creep.memory.role == undefined || creep.spawning) {
            continue;
        }
        
        manageRole[creep.memory.role].run(creep);
    }
    
    
    
}