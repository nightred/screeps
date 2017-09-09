/*
 * Defense system
 *
 * defense provides monitoring of rooms for invaders (npc or player)
 * and respondes to the threats
 *
 */

var logger = new Logger('[Defense]');
logger.level = C.LOGLEVEL.DEBUG;

var Defense = function() {
    // init
};

Object.defineProperty(Defense.prototype, 'squad', {
    get: function() {
        if (!this.memory.squadPid) return false;
        return Game.kernel.getProcessByPid(this.memory.squadPid);
    },
    set: function(value) {
        this.memory.squadPid = value.pid;
    },
});

Defense.prototype.run = function() {
    let room = Game.rooms[this.memory.workRoom];

    room.memory.defense = room.memory.defense || {}

    let defense = room.memory.defense;

    if (room.controller && room.controller.my) {
        this.doSafeMode(room);
    }

    if (this.memory.workRoom == this.memory.spawnRoom) {
        this.doSquadSpawnLimits();
    }

    this.doDefenseMode(room);

    Game.kernel.sleepProcess(this.pid, (C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));
};

Defense.prototype.doSquadSpawnLimits = function(room) {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

    let creepLimit = 0;
    let minSize = 200;
    let maxSize = 200;

    let rlevel = spawnRoom.controller.level;
    if (rlevel == 2 || rlevel == 3) {
        minSize = 200;
        maxSize = 300;
        creepLimit = 1;
    } else if (rlevel == 4 || rlevel == 5 || rlevel == 6) {
        minSize = 200;
        maxSize = 500;
        creepLimit = 1;
    } else if (rlevel == 7) {
       minSize = 200;
       maxSize = 800;
       creepLimit = 1;
    } else if (rlevel == 8) {
        minSize = 400;
        maxSize = 9999;
        creepLimit = 2;
    }

    let record = {
        name: 'techs',
        task: C.TASK_MILITIA,
        role: C.ROLE_COMBAT_MILITIA,
        maxSize: maxSize,
        minSize: minSize,
        limit: creepLimit,
    };

    let process = this.squad;

    if (!process) {
        logger.error('failed to load squad process for creep group update');
        return;
    }

    process.setGroup(record);
};

Defense.prototype.doDefenseMode = function(room) {
    let defense = room.memory.defense;

    let targets = room.getHostiles();

    targets = _.filter(targets, creep =>
        creep.owner &&
        !isAlly(creep.owner.username)
    );

    if (targets.length <= 0) {
        if (defense.active == 1) {
            defense.cooldown = defense.cooldown || Game.time;

            if ((defense.cooldown + C.DEFENSE_COOLDOWN) < Game.time) {
                defense.active = 0;

                delQueue(defense.jobId);

                defense.jobId = undefined;
            }
        }

        return;
    }

    defense.cooldown = defense.cooldown != undefined ? undefined : defense.cooldown;

    if (defense.active != 1) {
        defense.tick = Game.time;
        defense.active = 1;
        defense.creepLimit = 1;

        logger.info('defense mode activated in room: ' + room.toString());
    }

    let creepLimit = Math.ceil((Game.time - defense.tick) / C.DEFENSE_LIMIT_INCREASE_DELAY);

    if (defense.creepLimit < creepLimit) {
        defense.creepLimit = creepLimit;
    }

    if (!defense.jobId || !getQueueRecord(defense.jobId)) {
        let record = {
            workRoom: room.name,
            spawnRoom: this.memory.spawnRoom,
            task: C.WORK_DEFENSE,
            priority: 10,
        };

        defense.jobId = addQueueWork(record);
    }

    let task = getQueueRecord(defense.jobId);

    if (defense.creepLimit > task.creepLimit) {
        task.creepLimit = defense.creepLimit;
    }
};

Defense.prototype.doSafeMode = function(room) {
    let spawns = room.getSpawns();

    if (spawns.length <= 0) { return false; }

    let alert = false;

    for (let i = 0; i < spawns.length; i++) {
        if (spawns[i].hits < (spawns[i].hitsMax / 2)) {
            alert = true;
            break;
        }
    }

    if (alert && !room.controller.safeMode &&
        !room.controller.safeModeCooldown &&
        room.controller.safeModeAvailable > 1
    ) {

        room.controller.activateSafeMode();

        logger.info('safe mode activated in room: ' + room.toString());
    }
};

Defense.prototype.initSquad = function() {
    let imageName = 'managers/squad';
    let squadName = this.memory.workRoom + '_defense';

    let process = Game.kernel.startProcess(this, imageName, {
        name: squadName,
        spawnRoom: this.memory.spawnRoom,
        workRooms: this.memory.workRoom,
    });

    if (!process) {
        logger.error('failed to create process ' + imageName);
        return;
    }

    this.squad = process;
};

registerProcess('managers/defense', Defense);
