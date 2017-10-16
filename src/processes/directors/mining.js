/*
 * Director Mining
 *
 * runs processes to manage mining in the room
 *
 */

var logger = new Logger('[Mining Director]');

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

    for (var i = 0; i < sources.length; i++) {
        let source = Game.getObjectById(sources[i]);
        let process = Game.kernel.getProcessByPid(this.processRecords[source.id]);
        if (!process) {
            process = Game.kernel.startProcess(this, C.TASK_SOURCE, {
                sourceId: source.id,
                spawnRoom: this.memory.spawnRoom,
                workRoom: this.memory.workRoom,
            });
            if (!process) {
                logger.error('failed to create process ' + C.TASK_SOURCE);
                return;
            }
            this.processRecords[source.id] = process.pid;
        }
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

    let process = Game.kernel.getProcessByPid(this.processRecords[mineral.id]);
    if (!process) {
        process = Game.kernel.startProcess(this, C.TASK_MINERAL, {
            mineralId: mineral.id,
            extractorId: extractors[0],
            spawnRoom: this.memory.spawnRoom,
            workRoom: this.memory.workRoom,
        });
        if (!process) {
            logger.error('failed to create process ' + C.TASK_MINERAL);
            return;
        }
        this.processRecords[mineral.id] = process.pid;
    }
};

registerProcess(C.DIRECTOR_MINING, directorMining);
