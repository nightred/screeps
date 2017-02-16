/*
 * Creep role managment
 *
 * Provides functions for each role
 *
 * max: the spawn limit
 * run: the default function for the role
 * units: list all creeps of the role
 * isMax: is the role at the spawn limit
 *
 */

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleHauler = require('role.hauler');
var roleService = require('role.service');

var manageRole = {
    
    harvester: {
        max:    Constant.LIMIT_HARVESTERS,
        run:    creep => roleHarvester.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && 
            creep.memory.despawn != true),
        isMax:  () => manageRole.harvester.units().length >= manageRole.harvester.max,
    },
    
    upgrader: {
        max:    Constant.LIMIT_UPGRADERS,
        run:    creep => roleUpgrader.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && 
            creep.memory.despawn != true),
        isMax:  () => manageRole.upgrader.units().length >= manageRole.upgrader.max,
    },
    
    service: {
        max:    Constant.LIMIT_SERVICE,
        run:    creep => roleService.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'service' && 
            creep.memory.despawn != true),
        isMax:  () => manageRole.service.units().length >= manageRole.service.max,
    },
    
    builder: {
        max:    Constant.LIMIT_BUILDERS,
        run:    creep => roleBuilder.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && 
            creep.memory.despawn != true),
        isMax:  () => manageRole.builder.units().length >= manageRole.builder.max,
    },
    
    hauler: {
        max:    Constant.LIMIT_HAULERS,
        run:    creep => roleHauler.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler' && 
            creep.memory.despawn != true),
        isMax:  () => manageRole.hauler.units().length >= manageRole.hauler.max,
    },
    
    repairer: {
        max:    Constant.LIMIT_REPAIRERS,
        run:    creep => roleRepairer.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && 
            creep.memory.despawn != true),
        isMax:  () => manageRole.repairer.units().length >= manageRole.repairer.max,
    },
    
    getUnitsInRoomByRole: function(room, role) {
        
        return false;
    },
    
    isUnitsInRoomMax: function(room, role) {
        
        return false;
    },
    
}

module.exports = manageRole;