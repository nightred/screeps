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
        
        let energy = room.energyAvailable;
        energy = energy > Constant.ENERGY_CREEP_SPAWN_MAX ? Constant.ENERGY_CREEP_SPAWN_MAX : energy;
        
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                if (Constant.DEBUG) {
                    console.log("DEBUG - clearing non-existing creep memory: " + name);
                }
            }
        }
        
        if (!room.spawning && energy >= 200) {
            
            let targetSpawn = room.find(FIND_MY_SPAWNS);
            let name = undefined;
            let type = null;
            
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
            } else if (!manageRole.repairer.isMax()) {
                type = 'repairer';
                name = targetSpawn[0].createRepairer(energy);
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
    }
    
};

module.exports = manageCreep;