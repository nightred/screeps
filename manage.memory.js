/*
 * Memory managment of objects
 *
 * Creates memory of objects in a room
 * Updates the room memory on a cycle
 *
 * Memory Types
 *  StructuresContainer, Sources
 *
 */

var manageMemory = {
    
    run: function(room) {
        
        this.doContainers(room);
        this.doSpawnLimits(room);
        
    },
    
    doSpawnLimits: function(room) {
        if (!room.memory.limitsInit) {
            room.memory.limits = room.memory.limits || {};
            room.memory.limits.service = Constant.LIMIT_SERVICE;
            room.memory.limits.upgrader = Constant.LIMIT_UPGRADERS;
            room.memory.limits.harvester = Constant.LIMIT_HARVESTERS;
            room.memory.limits.repairer = Constant.LIMIT_REPAIRERS;
            room.memory.limits.hauler = Constant.LIMIT_HAULERS;
            
            room.memory.limitsInit = true;
        }
    },
    
    doContainers: function(room) {
        if (room.memory.containersMemory < (Game.time - 20) || !room.memory.containersMemory) {
            for (let containerId in room.memory.structureContainers) {
                if (!Game.getObjectById(containerId)) {
                    delete room.memory.structureContainers[containerId];
                    if (Constant.DEBUG >= 1) { console.log('INFO - clearing non-existant container: ' + containerId); }
                }
            }
            
            var targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                }
            });
            
            for (let target of targets) {
                if (!target.memory.type) {
                    target.memory.type = 'default';
                }
            }
            
            room.memory.containersMemory = Game.time;
        }
    },
    
}

module.exports = manageMemory;
