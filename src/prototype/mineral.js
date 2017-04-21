/*
 * Mineral common functions
 *
 * Provides common functions to all minerals
 *
 */

Mineral.prototype.getLocalContainer = function() {
    if (!this.memory.containerId || !Game.getObjectById(this.memory.containerId)) {
        this.memory.containerId = this.getContainerAtRange(2);
    }
    return this.memory.containerId;
}

Mineral.prototype.getContainerAtRange = function(size) {
    let targets = this.room.lookForAtArea(LOOK_STRUCTURES, this.pos.y - size, this.pos.x - size, this.pos.y + size, this.pos.x + size, true);
    targets = _.filter(targets, target => target.structure.structureType == STRUCTURE_CONTAINER);
    if (targets.length <= 0) { return false; }
    targets[0].structure.memory.type = 'in';
    return targets[0].structure.id;
}

Mineral.prototype.clearContainer = function() {
    this.memory.containerId = false;
    return true;
}
