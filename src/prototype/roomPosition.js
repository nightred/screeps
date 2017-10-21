/*
 * Room Position common functions
 *
 * Provides common functions to all room position objects
 *
 */

RoomPosition.prototype.fromDirection = function(direction) {
    return new RoomPosition(this.x + C.DIRECTIONS[direction][0],
        this.y + C.DIRECTIONS[direction][1],
        this.roomName
    );
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

RoomPosition.prototype.isWalkable = function() {
    if (this.getTerrainAt() == 'wall') return false;
    let objects = this.lookFor(LOOK_STRUCTURES);
    let object;
    for (object of objects) {
        if (OBSTACLE_OBJECT_TYPES.indexOf(object.structureType) >= 0) return false;
    }
    return true;
};

RoomPosition.prototype.getInRange = function (range = 1) {
    const bound = createBoundingBoxForRange(this.x, this.y, range);
    let positions = [];
    for (var x = bound.left; x <= bound.right; x++) {
        for (var y = bound.top; y <= bound.bottom; y++) {
            if (sX == this.x && sy == this.y) continue;
            positions.push(new RoomPosition(x, y, this.roomName));
        }
    }
    return positions;
};

RoomPosition.prototype.getMostOpenInRange = function (range = 1) {
    const walkable = this.getWalkableInRange(range);
    let bestPos;
    let bestScore = 0;
    let pos;
    for (pos of walkable) {
        const score = pos.getWalkableInRange(1).length;
        if (bestScore > score) continue;
        bestScore = score;
        bestPos = pos;
    }
    return bestPos;
};

RoomPosition.prototype.getWalkableInRange = function (range = 1) {
    return _.filter(this.getInRange(range), pos => pos.isWalkable());
};

RoomPosition.prototype.getTerrainAt = function () {
  return Game.map.getTerrainAt(this);
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

var createBoundingBoxForRange = function(x, y, range = 1) {
    const left = Math.max(x - range, 0);
    const right = Math.min(x + range, 49);
    const top = Math.max(y - range, 0);
    const bottom = Math.min(y + range, 49);
    return {left, right, top, bottom};
}
