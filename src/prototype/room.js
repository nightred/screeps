/*
 * Room common functions
 *
 * Provides common functions to all rooms
 *
 */

Room.prototype.getSourceCount = function() {
    if (!this.memory.sourceCount) {
        this.memory.sourceCount = this.find(FIND_SOURCES).length;
    }

    return this.memory.sourceCount;
};

// Find wrappers
Room.prototype.getHostileConstructionSites = function() {
    return this.find(FIND_HOSTILE_CONSTRUCTION_SITES);
};

Room.prototype.getConstructionSites = function() {
    return this.find(FIND_MY_CONSTRUCTION_SITES);
};

Room.prototype.getSources = function() {
    return this.find(FIND_SOURCES);
};

Room.prototype.getMinerals = function() {
    return this.find(FIND_MINERALS);
};

Room.prototype.getStructures = function() {
    return this.find(FIND_STRUCTURES);
};

Room.prototype.getMyStructures = function() {
    return this.find(FIND_MY_STRUCTURES);
};

Room.prototype.getCreeps = function() {
    return this.find(FIND_MY_CREEPS);
};

Room.prototype.getHostiles = function() {
    return this.find(FIND_HOSTILE_CREEPS);
};

Room.prototype.getHostileStructures = function() {
    return this.find(FIND_HOSTILE_STRUCTURES);
};

Room.prototype.getFlags = function() {
    return this.find(FIND_FLAGS);
};

Room.prototype.getSpawns = function() {
    return this.find(FIND_MY_SPAWNS);
};

Room.prototype.getHostileSpawns = function() {
    return this.find(FIND_HOSTILE_SPAWNS);
};

// find exact structures using native cache
Room.prototype.getNuker = function() {
    return _.filter(this.getMyStructures(), structure =>
        structure.structureType == STRUCTURE_NUKER)[0];
};

Room.prototype.getPowerSpawn = function() {
    return _.filter(this.getMyStructures(), structure =>
        structure.structureType == STRUCTURE_POWER_SPAWN)[0];
};

Room.prototype.getLinks = function() {
    return _.filter(this.getMyStructures(), structure =>
        structure.structureType == STRUCTURE_LINK);
};

Room.prototype.getContainers = function() {
    return _.filter(this.getStructures(), structure =>
        structure.structureType == STRUCTURE_CONTAINER);
};

Room.prototype.getTowers = function() {
    return _.filter(this.getMyStructures(), structure =>
        structure.structureType == STRUCTURE_TOWER);
};

Room.prototype.getExtensions = function() {
    return _.filter(this.getMyStructures(), structure =>
        structure.structureType == STRUCTURE_EXTENSION);
};

Room.prototype.getExtractors = function() {
    return _.filter(this.getMyStructures(), structure =>
        structure.structureType == STRUCTURE_EXTRACTOR);
};

// room distances
Room.prototype.getRoomLinearDistance = function(roomName) {
    if (!room) { return ERR_INVALID_ARGS; }
    let posStart = this.name.split(/([N,E,S,W])/);
    let posEnd = roomName.split(/([N,E,S,W])/);

    let diffX = posStart[1] == posEnd[1] ? Math.abs(posStart[2] - posEnd[2]) : posStart[2] + posEnd[2] + 1;
    let diffY = posStart[3] == posEnd[3] ? Math.abs(posStart[4] - posEnd[4]) : posStart[4] + posEnd[4] + 1;

    return diffX + diffY;
}

Room.prototype.getSourceCount = function() {
    if (!this.memory.sourceCount) {
        this.memory.sourceCount = this.getSources().length;
    }

    return this.memory.sourceCount;
};

Room.prototype.cleanSourceHarvesters = function() {
    let sources = _.filter(this.getSources(), source =>
        source.memory.harvester
        );
    if (sources.length <= 0) { return true; }

    for (i = 0; i < sources.length; i++) {
        if (sources[i].memory.harvester) { continue; }
        let name = sources[i].memory.harvester;
        if (!Game.creeps[name]) {
            sources[i].removeHarvester();
        }
    }

    return true;
};

Room.prototype.getHarvestTarget = function() {
    let sources = [];

    for (let source of this.getSources()) {
        let count = 0;
        for (let roomCreep of this.find(FIND_MY_CREEPS)) {
            if (roomCreep.memory.harvestTarget === source.id &&
                roomCreep.memory.role == 'harvester'
                ) {
                count++;
            }
        }
        if (count < C.HARVESTERS_PER_SOURCE) {
            sources.push(source);
        }
    }

    if (sources.length > 0) {
        return sources[0].id;
    }

    return false;
};

Room.prototype.getSpawn = function() {
    if (!this.memory.spawnId || this.memory.spawnId == undefined) {
        this.findSpawn();
    }

    return this.memory.spawnId;
};

Room.prototype.findSpawn = function() {
    let targets = this.find(FIND_MY_SPAWNS);

    if (targets.length > 0) {
        this.memory.spawnId = targets[0].id;
    } else {
        this.memory.spawnId = false;
    }
};

Room.prototype.getConstructionAtArea = function(pos, range) {
        let objects = this.lookForAtArea(
            LOOK_CONSTRUCTION_SITES,
            pos.y - range,
            pos.x - range,
            pos.y + range,
            pos.x + range,
            true
        );

        if (objects.length == 0) {
            return false;
        }

        return objects[0].constructionSite;
};

Room.prototype.getCoverage = function() {
    this.memory.roomCoverage = this.memory.roomCoverage || [];

    return this.memory.roomCoverage;
};

Room.prototype.addCoverage = function(roomName) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    this.memory.roomCoverage = this.memory.roomCoverage || [];

    if (this.memory.roomCoverage.indexOf(roomName) === -1) {
        this.memory.roomCoverage.push(roomName);
    }

    return true;
};

Room.prototype.remCoverage = function(roomName) {
    if (!roomName) { return ERR_INVALID_ARGS; }

    this.memory.roomCoverage = this.memory.roomCoverage || [];

    let index = this.memory.roomCoverage.indexOf(roomName);

    if (index != -1) {
        this.memory.roomCoverage.splice(index, 1);
    }

    return true;
};

Room.prototype.isInCoverage = function(roomName) {
    this.memory.roomCoverage = this.memory.roomCoverage || [];

    return (this.memory.roomCoverage.indexOf(roomName) != -1) ? true : false;
};

Room.prototype.countCoverage = function() {
    this.memory.roomCoverage = this.memory.roomCoverage || [];

    return this.memory.roomCoverage.length;
};

Room.prototype.toString = function() {
    return '<p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + this.name + '\">' + this.name + '</a></p>';
};
