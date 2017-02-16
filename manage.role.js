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

var manageRole = {
    
    harvester: {
        max:    Constant.LIMIT_HARVESTERS,
        run:    creep => roleHarvester.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester'),
        isMax:  () => manageRole.harvester.units().length >= manageRole.harvester.max
    },
    
    upgrader: {
        max:    Constant.LIMIT_UPGRADERS,
        run:    creep => roleUpgrader.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader'),
        isMax:  () => manageRole.upgrader.units().length >= manageRole.upgrader.max
    },
    
    builder: {
        max:    Constant.LIMIT_BUILDERS,
        run:    creep => roleBuilder.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'builder'),
        isMax:  () => manageRole.builder.units().length >= manageRole.builder.max
    },
    
    hauler: {
        max:    Constant.LIMIT_HAULERS,
        run:    creep => roleHauler.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler'),
        isMax:  () => manageRole.hauler.units().length >= manageRole.hauler.max
    },
    
    repairer: {
        max:    Constant.LIMIT_REPAIRERS,
        run:    creep => roleRepairer.run(creep),
        units:  () => _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer'),
        isMax:  () => manageRole.repairer.units().length >= manageRole.repairer.max
    }
    
}

module.exports = manageRole;