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
    
    run: function(manageRole, room) {
        
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                if (Constant.DEBUG) {
                    console.log("DEBUG - clearing non-existant creep memory: " + name);
                }
            }
        }
        
        let energy = room.energyAvailable;
        energy = energy > Constant.ENERGY_CREEP_SPAWN_MAX ? Constant.ENERGY_CREEP_SPAWN_MAX : energy;
        
        if (!room.spawning && energy >= 200) {
            
            let spawn = Game.getObjectById(room.getSpawn());
            if (!spawn) {
                return false;
            }
            
            let name = undefined;
            let type = null;
            
            if (room.controller.level <= Constant.CONTROLLER_WITHDRAW_LEVEL) {
                if (!manageRole.harvester.isMax(spawn)) {
                    type = 'harvester';
                    name = spawn.createHarvester(energy);
                } else if (!manageRole.upgrader.isMax(spawn)) {
                    type = 'upgrader';
                    name = spawn.createUpgrader(energy);
                } else if (!manageRole.builder.isMax(spawn)) {
                    type = 'builder';
                    name = spawn.createBuilder(energy);
                } else if (!manageRole.hauler.isMax(spawn)) {
                    type = 'hauler';
                    name = spawn.createHauler(energy);
                } else if (!manageRole.service.isMax(spawn)) {
                    type = 'service';
                    name = spawn.createService(energy);
                } else if (!manageRole.repairer.isMax(spawn)) {
                    type = 'repairer';
                    name = spawn.createRepairer(energy);
                }
            } else {
                if (!manageRole.harvester.isMax(spawn)) {
                    type = 'harvester';
                    name = spawn.createHarvester(energy);
                } else if (!manageRole.hauler.isMax(spawn)) {
                    type = 'hauler';
                    name = spawn.createHauler(energy);
                } else if (!manageRole.service.isMax(spawn)) {
                    type = 'service';
                    name = spawn.createService(energy);
                } else if (!manageRole.upgrader.isMax(spawn)) {
                    type = 'upgrader';
                    name = spawn.createUpgrader(energy);
                } else if (!manageRole.repairer.isMax(spawn)) {
                    type = 'repairer';
                    name = spawn.createRepairer(energy);
                } else if (!manageRole.builder.isMax(spawn)) {
                    type = 'builder';
                    name = spawn.createBuilder(energy);
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
        console.log("INFO - spawning " + type + " named " + name + " with " + Game.creeps[name].body.length + " parts");
    },
    
    doDeSpawn: function(creep) {
        if (!creep.memory.despawn || creep.memory.despawn == undefined) {
            creep.setDespawn();
        }
        
    	let target = Game.getObjectById(creep.room.getSpawn());
    	if (!target) {
    		return false;
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
                    let roomSpawn = Game.getObjectById(creep.room.getSpawn());
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