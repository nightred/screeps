/*
 * Director Field Tech
 *
 * director field tech task handles the spawning of tech units
 *
 */

var logger = new Logger('[FieldTech Director]');
logger.level = C.LOGLEVEL.DEBUG;

var directorFieldTech = function() {
    // init
}

Object.defineProperty(directorFieldTech.prototype, 'squad', {
    get: function() {
        if (!this.memory.squadPid) return false;
        return Game.kernel.getProcessByPid(this.memory.squadPid);
    },
    set: function(value) {
        this.memory.squadPid = value.pid;
    },
});

directorFieldTech.prototype.run = function() {
    if (isSleep(this)) return;

    if (!this.squad) {
        this.initSquad();
    }

    this.doSquadLimits();

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

directorFieldTech.prototype.doSquadLimits = function() {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 1 || rlevel == 2 || rlevel == 3 || rlevel == 4) {
        maxSize = 400;
    } else if (rlevel == 5 || rlevel == 6) {
        minSize = 400;
        maxSize = 600;
    } else if (rlevel == 7 || rlevel == 8) {
        minSize = 500;
        maxSize = 9999;
    }

    let creepLimit = 1;
    if (this.memory.creepLimit) {
        creepLimit = this.memory.creepLimit;
    }

    let record = {
        name: 'fieldtechs',
        task: C.TASK_FIELDTECH,
        role: C.ROLE_FIELDTECH,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
    };

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        continue;
    }

    process.setGroup(record);
};

/**
* @param {roomName} roomName the room name
* @param {Args} Args Array of values from flag
**/
directorFieldTech.prototype.flag = function(roomName, args) {
    this.memory.workRoom = roomName;
    this.memory.spawnRoom = args[2];
    this.memory.creepLimit = args[3];
};

directorFieldTech.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let process = Game.kernel.startProcess(this, imageName, {
        name: (this.memory.spawnRoom + '_fieldtech'),
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        continue;
    }

    this.squad = process;
};

registerProcess(C.DIRECTOR_FIELDTECH, directorFieldTech);
