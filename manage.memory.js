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
        
        //console.log('ok - ' + room.memory.structureContainers);
        
        //for (let source of room.find(FIND_SOURCES)) {
        //    source.memory.test = 'ok';
        //}
    }
    
}

module.exports = manageMemory;