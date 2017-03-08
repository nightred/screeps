/*
 * Room common functions
 *
 * Provides common functions to all rooms
 *
 */

Room.prototype.getConstructionSites = function() {
    return this.find(FIND_MY_CONSTRUCTION_SITES);
};

Room.prototype.getSources = function() {
    return this.find(FIND_SOURCES);
};

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
        if (count < Constant.HARVESTERS_PER_SOURCE) {
            sources.push(source);
        }
    }

    if (sources.length > 0) {
        return sources[0].id;
    }

    return false;
};

Room.prototype.getDespawnContainer = function() {
    this.memory.deSpawnContainerId = this.memory.deSpawnContainerId || false;

    return this.memory.deSpawnContainerId;
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

Room.prototype.getSpawns = function() {
    let targets = this.find(FIND_MY_SPAWNS);

    if (targets.length > 0) {
        return targets;
    }

    return false;
};

Room.prototype.getContainers = function() {
    return this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
        }
    });
};

Room.prototype.getTowers = function() {
    return this.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        }
    });
};

Room.prototype.getExtensions = function() {
    return this.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });
};
