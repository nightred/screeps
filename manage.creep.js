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
                if (Memory.creeps[name].workId) {
                    Work.leaveWork(name, Memory.creeps[name].workId);
                }
                if (Constant.DEBUG >= 2) { console.log('DEBUG - clearing non-existant creep memory: ' + Memory.creeps[name].role + ' ' + name); }
                
                delete Memory.creeps[name];
            }
        }
        
        let energy = room.energyAvailable;
        energy = energy > Constant.ENERGY_CREEP_SPAWN_MAX ? Constant.ENERGY_CREEP_SPAWN_MAX : energy;
        
        if (!room.spawning && energy >= 200) {
            
            let spawn = Game.getObjectById(room.getSpawn());
            if (!spawn) { return false; }
            
            let name = undefined;
            let type = null;
            
            if (room.controller.level <= Constant.CONTROLLER_WITHDRAW_LEVEL) {
                if (!manageRole.harvester.isMax(spawn)) {
                    type = 'harvester';
                    name = spawn.createHarvester(energy);
                } else if (!manageRole.upgrader.isMax(spawn)) {
                    type = 'upgrader';
                    name = spawn.createUpgrader(energy);
                } else if (!manageRole.hauler.isMax(spawn)) {
                    type = 'hauler';
                    name = spawn.createHauler(energy);
                } else if (!manageRole.service.isMax(spawn)) {
                    type = 'service';
                    name = spawn.createService(energy);
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
                }
            }
            
            if (name != undefined && !(name < 0)) {
                if (Constant.DEBUG >= 3) { console.log("DEBUG - spawning with energy: " + energy); }
                
                manageCreep.spawned(name, type);
            }
        }
    },
    
    spawned: function(name, type) {
        if (Constant.DEBUG >= 1) { console.log("INFO - spawning " + type + " named " + name + " with " + Game.creeps[name].body.length + " parts"); }
    },
    
    doDespawn: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.despawn || creep.memory.despawn == undefined) {
            creep.setDespawn();
        }
        
    	let target = Game.getObjectById(creep.room.getSpawn());
    	if (!target) { return false; }
        
        if (creep.room.memory.deSpawnContainerId == undefined) {
            creep.room.memory.deSpawnContainerId = false;
        }
        
        if (creep.room.memory.deSpawnContainerId) {
            creep.memory.goingTo = creep.room.memory.deSpawnContainerId;
        }
        
        if (!creep.memory.goingTo || creep.memory.goingTo == undefined) {
            this.getDespawnContainer(creep);
        } else {
            this.doDespawnOnContainer(creep);
        }
        
        return true;
    },
    
    doDespawnOnContainer: function(creep) {
        if (!creep) { return false; }
        
        let target = Game.getObjectById(creep.memory.goingTo);
        if (!target) { 
            creep.memory.goingTo = false;
            return false;
        }
        
        if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
            if (creep.room.memory.deSpawnContainerId && creep.room.memory.spawnId) { 
                if (Constant.DEBUG >= 1) { console.log("INFO - recycling " + creep.memory.role + " " + creep.name); }
                let roomSpawn = Game.getObjectById(creep.room.getSpawn());
                roomSpawn.recycleCreep(creep);
            } else {
                creep.suicide();
            }
        }
        
        creep.moveTo(target.pos.x, target.pos.y);
    
        return true;
    },
    
    getDespawnContainer: function(creep) {
        if (!creep) { return false; }
        
        let targets = creep.getTargetContainerEnergy('store', 'all');
        if (targets.length == 0) { 
            creep.suicide();
            
            return false;
        }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));
        
        return creep.setGoingTo(targets[0]);
    },
    
};

module.exports = manageCreep;
