/*
 * StructureStorage common functions
 *
 * Provides common functions to all StructureStorage
 *
 */

StructureStorage.prototype.getLinkAtRange = function(size) {
    let targets = this.room.lookForAtArea(LOOK_STRUCTURES, this.pos.y - size, this.pos.x - size, this.pos.y + size, this.pos.x + size, true);
    targets = _.filter(targets, target => target.structure.structureType == STRUCTURE_LINK);
    if (targets.length <= 0) { return false; }
    targets[0].structure.memory.type = 'storage';
    return targets[0].structure.id;
}
