/*
 * Director Mining
 *
 * runs processes to manage mining in the room
 *
 */

var logger = new Logger('[Mining Director]');
logger.level = C.LOGLEVEL.DEBUG;

var directorMining = function() {
    // init
}

Object.defineProperty(directorMining.prototype, 'squad', {
    get: function() {
        if (!this.memory.squadPid) return false;
        return Game.kernel.getProcessByPid(this.memory.squadPid);
    },
    set: function(value) {
        this.memory.squadPid = value.pid;
    },
});

directorMining.prototype.run = function() {
    if (!Game.rooms[this.memory.workRoom]) return;

    if (!this.squad) this.initSquad();

    this.doSourceMining();
    this.doMineralMining();

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorMining.prototype.doSourceMining = function() {
    if (!this.memory.sourceInit) {
        if (this.getSources()) this.memory.sourceInit = 1;
    }

    for (let i = 0; i < this.memory.sources.length; i++) {
        let source = this.memory.sources[i];
        this.doSourceSquadGroup(source);
    }
};

directorMining.prototype.doMineralMining = function() {
    if (!this.memory.mineralInit) {
        if (this.getMineral()) this.memory.mineralInit = 1;
    }

    if (!this.memory.extractorId || !Game.getObjectById(this.memory.extractorId)) {
        let room = Game.rooms[this.memory.workRoom];
        let extractors = room.getExtractors();
        if (extractors.length === 0) return;
        this.memory.extractorId = extractors[0].id;
    }

    this.doMineralSquadGroup();
};

directorMining.prototype.doSourceSquadGroup = function(sourceRecord) {
    let groupName = 'source' + sourceRecord.id;

    let record = {
        name: groupName,
        task: C.TASK_SOURCE,
        role: C.ROLE_MINER,
        priority: 50,
        maxSize: 9999,
        minSize: 200,
        limit: 1,
        creepArgs: {
            sourceId: sourceRecord.id,
        },
    };

    let source = Game.getObjectById(sourceRecord.id);

    if (source && source.getDropContainer()) {
        record.creepArgs.style = 'drop';
    } else if (this.memory.spawnRoom != this.memory.roomName) {
        record.creepArgs.style = 'ranged';
    }

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

directorMining.prototype.doMineralSquadGroup = function() {
    let groupName = 'mineral';

    let record = {
        name: groupName,
        task: C.TASK_MINERAL,
        role: C.ROLE_MINER,
        priority: 50,
        maxSize: 9999,
        minSize: 200,
        limit: 1,
        creepArgs: {
            mineralId: this.memory.mineralId,
            extractorId: this.memory.extractorId,
        },
    };

    let mineral = Game.getObjectById(this.memory.mineralId);
    if (mineral && mineral.getContainer()) {
        record.creepArgs.style = 'drop';
    }

    let process = this.squad;
    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

directorMining.prototype.getSources = function() {
    this.memory.sources = this.memory.sources || [];

    let room = Game.rooms[this.memory.workRoom];
    if (!room) return false;

    let sources = room.getSources();
    if (sources.length === 0) return true;

    for (let i = 0; i < sources.length; i++) {
        this.memory.sources.push({
            id: sources[i].id,
            pid: undefined,
        });
    }

    return true;
};

directorMining.prototype.getMineral = function() {
    let room = Game.rooms[this.memory.workRoom];
    if (!room) return false;

    let minerals = room.getMinerals();
    if (minerals.length === 0) return true;

    this.memory.mineralId = minerals[0].id;

    return true;
};

directorMining.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let process = Game.kernel.startProcess(this, imageName, {
        squadName: (this.memory.workRoom + '_mining'),
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        return;
    }

    this.squad = process;
};

registerProcess(C.DIRECTOR_MINING, directorMining);
