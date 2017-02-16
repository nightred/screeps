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
        max:    spawn => manageRole.getRoomMax(spawn, 'harvester'),
        run:    creep => roleHarvester.run(creep),
        units:  spawn => manageRole.getUnitsInRoomByRole(spawn, 'harvester'),
        isMax:  spawn => manageRole.isUnitsInRoomMax(spawn, 'harvester'),
    },
    
    upgrader: {
        max:    spawn => manageRole.getRoomMax(spawn, 'upgrader'),
        run:    creep => roleUpgrader.run(creep),
        units:  spawn => manageRole.getUnitsInRoomByRole(spawn, 'upgrader'),
        isMax:  spawn => manageRole.isUnitsInRoomMax(spawn, 'upgrader'),
    },
    
    service: {
        max:    spawn => manageRole.getRoomMax(spawn, 'service'),
        run:    creep => roleService.run(creep),
        units:  spawn => manageRole.getUnitsInRoomByRole(spawn, 'service'),
        isMax:  spawn => manageRole.isUnitsInRoomMax(spawn, 'service'),
    },
    
    builder: {
        max:    spawn => manageRole.getRoomMax(spawn, 'builder'),
        run:    creep => roleBuilder.run(creep),
        units:  spawn => manageRole.getUnitsInRoomByRole(spawn, 'builder'),
        isMax:  spawn => manageRole.isUnitsInRoomMax(spawn, 'builder'),
    },
    
    hauler: {
        max:    spawn => manageRole.getRoomMax(spawn, 'hauler'),
        run:    creep => roleHauler.run(creep),
        units:  spawn => manageRole.getUnitsInRoomByRole(spawn, 'hauler'),
        isMax:  spawn => manageRole.isUnitsInRoomMax(spawn, 'hauler'),
    },
    
    repairer: {
        max:    spawn => manageRole.getRoomMax(spawn, 'repairer'),
        run:    creep => roleRepairer.run(creep),
        units:  spawn => manageRole.getUnitsInRoomByRole(spawn, 'repairer'),
        isMax:  spawn => manageRole.isUnitsInRoomMax(spawn, 'repairer'),
    },
    
    getRoomMax: function(spawn, type) {
        return spawn.memory.limits[type];
    },
    
    getUnitsInRoomByRole: function(spawn, type) {
        return _.filter(Game.creeps, (creep) => 
            creep.memory.role == type && 
            creep.room.name == spawn.room.name &&
            creep.memory.despawn != true);
    },
    
    isUnitsInRoomMax: function(spawn, type) {
        return this[type].units(spawn).length >= this[type].max(spawn);
    },
    
}

module.exports = manageRole;