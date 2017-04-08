/*
 * Room Position common functions
 *
 * Provides common functions to all room position objects
 *
 */

RoomPosition.prototype.fromDirection = function(direction) {
    return new RoomPosition(this.x+C.DIRECTIONS[direction][0], this.y+C.DIRECTIONS[direction][1], this.roomName);
};

RoomPosition.prototype.getRampart = function() {
    let targets = _.find(this.look(), object =>
        object.structure &&
        object.structure.structureType == STRUCTURE_RAMPART);
    if (targets || targets.length == 0) { return false; }
    return targets[0];
};

RoomPosition.prototype.getStructure = function() {
    let targets = _.find(this.look(), object =>
        object.structure &&
        (object.structure.structureType == STRUCTURE_RAMPART ||
        OBSTACLE_OBJECT_TYPES[object.structure.structureType]));

    if (targets || targets.length == 0) { return false; }
    return targets[0];
};
