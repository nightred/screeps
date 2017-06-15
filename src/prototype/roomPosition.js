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
    let targets = this.look();
    targets = _.filter(targets, object => object.structure);
    if (!targets || targets.length == 0) { return false; }

    return targets[0].structure;
};

RoomPosition.prototype.isOnConstruction = function() {
    return this.getConstruction() != undefined;
};

RoomPosition.prototype.getConstruction = function() {
    return _.find(this.lookFor(LOOK_CONSTRUCTION_SITES), o =>
        o instanceof ConstructionSite
    );
};

RoomPosition.prototype.isOnRoad = function() {
    return this.getRoad() != undefined;
};

RoomPosition.prototype.getRoad = function() {
    return _.find(this.lookFor(LOOK_STRUCTURES), o =>
        o instanceof StructureRoad
    );
};

RoomPosition.prototype.isOnContainer = function() {
    return this.getContainer() != undefined;
};

RoomPosition.prototype.getContainer = function() {
    return _.find(this.lookFor(LOOK_STRUCTURES), o =>
        o instanceof StructureContainer
    );
};
