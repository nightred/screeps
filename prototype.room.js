/*
 * Room common functions
 *
 * Provides common functions to all rooms
 *
 */
 
Room.prototype.getSpawn = function() {
    if (!this.memory.spawnId || this.memory.spawnId == undefined) {
        this.findSpawn();
    }
    
    return this.memory.spawnId;
}

Room.prototype.findSpawn = function() {
    let targets = this.find(FIND_MY_SPAWNS);
    
    if (targets.length > 0) {
        this.memory.spawnId = targets[0].id;
    } else {
        this.memory.spawnId = false;
    }
}

Room.prototype.getContainers = function() {
    return this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
        }
    });
}


Room.prototype.getTowers = function() {
    return this.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        }
    });
}
    

Room.prototype.getExtensions = function() {
    return this.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });
}