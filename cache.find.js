/*
 * Provide find results for common find requests
 * cache the results where possible
 *
 */

var cacheFind = {
    
    cacheContainers: [],
    containers: function(room) {
        
        this.cacheContainers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER;
            }
        });
        
        return this.cacheContainers;
    },

    cacheTowers: [],
    towers: function(room) {
        
        this.cacheTowers = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        
        return this.cacheTowers;
    },
    
    cacheExtensions: [],
    extensions: function(room) {
        
        this.cacheExtensions = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION;
            }
        });
        
        return this.cacheExtensions;
    },
    
};

module.exports = cacheFind;