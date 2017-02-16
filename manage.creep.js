/*
 * Creep spawn managment
 *
 * Checks how many creeps are active
 * Spawns new creeps to fill out numbers as needed
 *
 * Priority:
 *  harvester, upgrader, builder, hauler, repairer
 *
 */
 
var manageCreep = {
    
    spawn: function(manageRole, room) {
        
        let energy = room.energyAvailable;
        energy = energy > Constant.ENERGY_CREEP_SPAWN_MAX ? Constant.ENERGY_CREEP_SPAWN_MAX : energy;
        
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                if (Constant.DEBUG) {
                    console.log("DEBUG - clearing non-existant creep memory: " + name);
                }
            }
        }
        
        if (!room.spawning && energy >= 200) {
            
            let targetSpawn = room.find(FIND_MY_SPAWNS);
            let name = undefined;
            let type = null;
            
            if (room.controller.level <= Constant.CONTROLLER_WITHDRAW_LEVEL) {
                if (!manageRole.harvester.isMax()) {
                    type = 'harvester';
                    name = targetSpawn[0].createHarvester(energy);
                } else if (!manageRole.upgrader.isMax()) {
                    type = 'upgrader';
                    name = targetSpawn[0].createUpgrader(energy);
                } else if (!manageRole.builder.isMax()) {
                    type = 'builder';
                    name = targetSpawn[0].createBuilder(energy);
                } else if (!manageRole.hauler.isMax()) {
                    type = 'hauler';
                    name = targetSpawn[0].createHauler(energy);
                } else if (!manageRole.service.isMax()) {
                    type = 'service';
                    name = targetSpawn[0].createService(energy);
                } else if (!manageRole.repairer.isMax()) {
                    type = 'repairer';
                    name = targetSpawn[0].createRepairer(energy);
                }
            } else {
                if (!manageRole.harvester.isMax()) {
                    type = 'harvester';
                    name = targetSpawn[0].createHarvester(energy);
                } else if (!manageRole.hauler.isMax()) {
                    type = 'hauler';
                    name = targetSpawn[0].createHauler(energy);
                } else if (!manageRole.service.isMax()) {
                    type = 'service';
                    name = targetSpawn[0].createService(energy);
                } else if (!manageRole.upgrader.isMax()) {
                    type = 'upgrader';
                    name = targetSpawn[0].createUpgrader(energy);
                } else if (!manageRole.repairer.isMax()) {
                    type = 'repairer';
                    name = targetSpawn[0].createRepairer(energy);
                } else if (!manageRole.builder.isMax()) {
                    type = 'builder';
                    name = targetSpawn[0].createBuilder(energy);
                }
            }
            
            if (name != undefined && !(name < 0)) {
                if (Constant.DEBUG) {
                    console.log("DEBUG - spawn energy: " + energy);
                }
                
                manageCreep.spawned(name, type);
            }
        }
    },
    
    spawned: function(name, type) {
        console.log("INFO - spawning new " + type + " named " + name + " with " + Game.creeps[name].body.length + " parts");
    },
    
    doDeSpawn: function(creep) {
        if (!creep.memory.despawn || creep.memory.despawn == undefined) {
            creep.memory.despawn = true;
            creep.memory.goingTo = false;
            creep.memory.harvestTarget = false;
            if (Constant.DEBUG) {
                console.log("DEBUG - end of life " + creep.memory.role + " " + creep.name);
            }
        }
        
        if (!creep.room.memory.spawnId || creep.room.memory.spawnId == undefined) {
            let targets = creep.room.find(FIND_MY_SPAWNS);
            
            if (targets.length > 0) {
                creep.room.memory.spawnId = targets[0].id;
            } else {
                creep.room.memory.spawnId = false;
            }
        }
        
        if (creep.room.memory.deSpawnContainerId == undefined) {
            creep.room.memory.deSpawnContainerId = false;
        }
        
        if (creep.room.memory.deSpawnContainerId) {
            creep.memory.goingTo = creep.room.memory.deSpawnContainerId;
        }
        
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            if (!creep.getTargetContainerEnergy('store', 'all')) {
                creep.moveToIdlePosition();
            }
        } else {
            let target = Game.getObjectById(creep.memory.goingTo);

            if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
                if (creep.room.memory.deSpawnContainerId && creep.room.memory.spawnId) { 
                    if (Constant.DEBUG) {
                        console.log("DEBUG - recycling " + creep.memory.role + " " + creep.name);
                    }
                    let roomSpawn = Game.getObjectById(creep.room.memory.spawnId);
                    roomSpawn.recycleCreep(creep);
                } else {
                    return true;
                }
            }
            
            creep.moveTo(target.pos.x, target.pos.y);
        }
        
        return true;
    },
    
};

module.exports = manageCreep;