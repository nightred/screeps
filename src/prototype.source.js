/*
 * Source common functions
 *
 * Provides common functions to all Source
 *
 */
 
Source.prototype.setHarvester = function(creepName) {
    this.memory.harvester = creepName;
    
    return true;
}

Source.prototype.removeHarvester = function() {
    this.memory.harvester = false;

    return true;
}
 
Source.prototype.getDropContainer = function() {
    if (this.memory.containerId == undefined) {
        this.memory.containerId = false;
    }
    
    if (!this.memory.containerId) {
        this.memory.containerId = this.getContainerAtRange(1);
    }
    
    return this.memory.containerId;
}

Source.prototype.getLocalContainer = function() {
    if (this.memory.containerId == undefined) {
        this.memory.containerId = false;
    }
    
    if (!this.memory.containerId) {
        this.memory.containerId = this.getContainerAtRange(2);
    }
    
    return this.memory.containerId;
}

Source.prototype.getContainerAtRange = function(size) {
    let targets = this.room.lookForAtArea(LOOK_STRUCTURES, this.pos.y - size, this.pos.x - size, this.pos.y + size, this.pos.x + size, true);
    targets = _.filter(targets, target => target.structure.structureType == STRUCTURE_CONTAINER);

    if (targets.length > 0) {
        targets[0].structure.memory.type = 'in';
        return targets[0].structure.id;
    } 
            
    return false;
}

Source.prototype.clearContainer = function() {
    this.memory.containerId = false;
    
    return true;
}
