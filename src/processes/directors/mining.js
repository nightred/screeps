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

_.merge(directorMining.prototype, require('lib.sources'));
_.merge(directorMining.prototype, require('lib.minerals'));
_.merge(directorMining.prototype, require('lib.extractors'));

Object.defineProperty(directorMining.prototype, 'processRecords', {
    get: function() {
        this.memory.processRecords = this.memory.processRecords || {};
        return this.memory.processRecords;
    },
    set: function(value) {
        this.memory.processRecords = this.memory.processRecords || {};
        this.memory.processRecords = value
    },
});

directorMining.prototype.run = function() {
    let room = Game.rooms[this.memory.workRoom];
    if (!room) return;

    this.cacheRoomSources(room);
    this.cacheRoomMinerals(room);
    this.cacheRoomExtractors(room);

    this.doSourceMining(room);
    this.doMineralMining(room);

    // remove old squad
    if (this.memory.squadPid) {
        Game.kernel.killProcess(this.memory.squadPid);
        this.memory.squadPid = undefined;
    }

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorMining.prototype.doSourceMining = function(room) {
    let sources = this.getRoomSources(room);

    for (let i = 0; i < sources.length; i++) {
        let source = Game.getObjectById(sources[i]);
        if (!source) continue;

        let style = 'default';
        if (source.getDropContainer()) {
            style = 'drop';
        } else if (this.memory.spawnRoom != this.memory.roomName) {
            style = 'ranged';
        }

        let process = Game.kernel.getProcessByPid(this.processRecords[source.id]);
        if (!process) {
            process = Game.kernel.startProcess(this, C.TASK_SOURCE, {
                spawnRoom: this.memory.spawnRoom,
                workRoom: this.memory.workRoom,
            });
            if (!process) {
                logger.error('failed to create process ' + C.TASK_SOURCE);
                return;
            }
            this.processRecords[source.id] = process.pid;
        }

        process.setSpawnDetails({
            spawnRoom: this.memory.spawnRoom,
            role: C.ROLE_MINER,
            priority: 50,
            maxSize: 9999,
            minSize: 200,
            limit: 1,
            creepArgs: {
                workRooms: this.memory.workRoom,
                sourceId: source.id,
                style: style,
            },
        });
    }
};

directorMining.prototype.doMineralMining = function(room) {
    let minerals = this.getRoomMinerals(room);
    let mineral = Game.getObjectById(minerals[0]);
    if (!mineral) return;

    let extractors = this.getRoomExtractors(room);
    if (!Game.getObjectById(extractors[0])) {
        if (this.processRecords[mineral.id])
            Game.kernel.killProcess(this.processRecords[mineral.id]);
        return;
    }

    let style = 'default';
    if (mineral.getContainer()) style = 'drop';

    let spawnRoom = Game.rooms[this.memory.spawnRoom];
    if (!spawnRoom) return;

    let creepLimit = 1;
    if (spawnRoom.storage &&
        spawnRoom.storage.store[RESOURCE_ENERGY] < C.DIRECTOR_MIN_ENG_MINERAL
    ) creepLimit = 0;

    let process = Game.kernel.getProcessByPid(this.processRecords[mineral.id]);
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_MINERAL, {});
        if (!process) {
            logger.error('failed to create process ' + C.TASK_MINERAL);
            return;
        }
        this.processRecords[mineral.id] = process.pid;
    }

    process.setSpawnDetails({
        spawnRoom: this.memory.spawnRoom,
        role: C.ROLE_MINER,
        priority: 85,
        maxSize: 9999,
        minSize: 200,
        limit: creepLimit,
        creepArgs: {
            workRooms: this.memory.workRoom,
            mineralId: mineral.id,
            extractorId: extractors[0],
            style: style,
        },
    });
};

registerProcess(C.DIRECTOR_MINING, directorMining);
