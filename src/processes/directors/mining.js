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

_.extend(directorMining.prototype, require('lib.sources'));
_.extend(directorMining.prototype, require('lib.minerals'));
_.extend(directorMining.prototype, require('lib.extractors'));

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
    let room = Game.rooms[this.memory.workRoom];
    if (!room) return;

    if (!this.squad) this.initSquad();
    this.cacheRoomSources(room);
    this.cacheRoomMinerals(room);
    this.cacheRoomExtractors(room);

    this.doSourceMining(room);
    this.doMineralMining(room);

    Game.kernel.sleepProcessbyPid(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorMining.prototype.doSourceMining = function(room) {
    let sources = this.getRoomSources(room);

    let process = this.squad;
    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    for (let i = 0; i < sources.length; i++) {
        let source = Game.getObjectById(sources[i]);
        if (!source) continue;

        let groupName = 'source' + source.id;
        let style = 'default';

        if (source.getDropContainer()) {
            style = 'drop';
        } else if (this.memory.spawnRoom != this.memory.roomName) {
            style = 'ranged';
        }

        process.setGroup({
            name: groupName,
            task: C.TASK_SOURCE,
            role: C.ROLE_MINER,
            priority: 50,
            maxSize: 9999,
            minSize: 200,
            limit: 1,
            creepArgs: {
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
    if (!Game.getObjectById(extractors[0])) return;

    let style = 'default';
    if (mineral.getContainer()) style = 'drop';

    let process = this.squad;
    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup({
        name: 'mineral',
        task: C.TASK_MINERAL,
        role: C.ROLE_MINER,
        priority: 50,
        maxSize: 9999,
        minSize: 200,
        limit: 1,
        creepArgs: {
            mineralId: mineral.id,
            extractorId: extractors[0],
            style: style,
        },
    });
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
