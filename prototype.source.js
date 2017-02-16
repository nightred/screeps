/*
 * Source common functions
 *
 * Provides common functions to all Source
 *
 */
 
Source.prototype.getLocalContainer = function() {
    
    if (this.memory.localContainerId == undefined) {
        this.memory.localContainerId = false;
    }
    
    if (!this.memory.localContainerId) {
        
        let size = Constant.HARVESTERS_CARRY ? 2 : 1;

        let targets = this.room.lookForAtArea(LOOK_STRUCTURES, this.pos.y - size, this.pos.x - size, this.pos.y + size, this.pos.x + size, true);
        targets = _.filter(targets, target => target.structure.structureType == STRUCTURE_CONTAINER);

        if (targets.length > 0) {
            this.memory.localContainerId = targets[0].structure.id;
            targets[0].structure.memory.type = 'in';
        } else {
            this.memory.localContainerId = false;
        }
    }
    
    return this.memory.localContainerId;
}

Source.prototype.clearLocalContainer = function() {
    this.memory.localContainerId = false;
    
    return true;
}

