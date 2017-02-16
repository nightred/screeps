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
        
        //console.log('ok - ' + room.memory.structureContainers);
        
        //for (let source of room.find(FIND_SOURCES)) {
        //    source.memory.test = 'ok';
        //}
    },
    
    doSpawn: function(room) {
        if (!room.memory.spawnInit) {
            room.memory.spawnId
            
            
            room.memory.spawnInit = true;
        }
    },
    
    doContainers: function(room) {
        if (room.memory.containersMemory < (Game.time - 20) || !room.memory.containersMemory) {
            for (let containerId in room.memory.structureContainers) {
                if (!Game.getObjectById(containerId)) {
                    delete room.memory.structureContainers[containerId];
                    if (Constant.DEBUG) {
                        console.log('DEBUG - clearing non-existant container: ' + containerId)
                    }
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