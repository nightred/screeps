/*
 * Director Source
 *
 * runs processes to manage mining of a source
 *
 */

var directorSource = function() {
    // init
};

Object.defineProperty(directorSource.prototype, 'squad', {
    get: function() {
        if (!this.memory.squadPid) return false;
        return Game.kernel.getProcessByPid(this.memory.squadPid);
    },
    set: function(value) {
        this.memory.squadPid = value.pid;
    },
});

directorSource.prototype.run = function() {
    if (isSleep(this)) return;

    if (!this.squad) {
        this.initSquad();
    }

    this.doSquadLimits();

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorSource.prototype.doSquadLimits = function() {
    let workRoom = Game.rooms[this.memory.workRoom];

    if (!workRoom) return;

    let creepLimit = 1;

    // remove old creep and clear spawn job when done
    let removeCreep = [];

    let record = {
        name: 'source',
        task: C.TASK_SOURCE,
        role: C.ROLE_MINER,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
        creepArgs: {
            sourceId: this.memory.sourceId,
        },
    };

    let source = Game.getObjectById(this.memory.sourceId);

    if (source && source.getDropContainer()) {
        record.creepArgs.style = 'drop';
    } else if (this.memory.spawnRoom != this.memory.roomName) {
        record.creepArgs.style = 'ranged';
    }

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        continue;
    }

    process.setGroup(record);
};

directorSource.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let process = Game.kernel.startProcess(this, imageName, {
        name: (this.memory.workRoom + '_source'),
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        continue;
    }

    this.squad = process;
};

registerProcess(C.DIRECTOR_SOURCE, directorSource);
