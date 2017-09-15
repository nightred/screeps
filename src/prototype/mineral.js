/*
 * Mineral common functions
 *
 * Provides common functions to all minerals
 *
 */

Mineral.prototype.getContainer = function() {
    let containerId = this.memory.containerId;
    if (!containerId || !Game.getObjectById(containerId)) {
        containerId = this.getContainerAtRange(1);
        if (containerId) this.memory.containerId = containerId;
    }
    return containerId;
}

Mineral.prototype.getContainerAtRange = function(size) {
    let room = this.room;
    let targets = room.lookForAtArea(LOOK_STRUCTURES, this.pos.y - size, this.pos.x - size, this.pos.y + size, this.pos.x + size, true);
    targets = _.filter(targets, target =>
        target.structure.structureType == STRUCTURE_CONTAINER
    );

    if (targets.length <= 0) return;

    targets[0].structure.memory.type = 'in';
    return targets[0].structure.id;
}

Mineral.prototype.clearContainer = function() {
    this.memory.containerId = undefined;
}
