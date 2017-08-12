/*
 * Defense system
 *
 * defense provides monitoring of rooms for invaders (npc or player)
 * and respondes to the threats
 *
 */

var Logger = require('util.logger');

var logger = new Logger('[Defense]');
logger.level = C.LOGLEVEL.DEBUG;

var Defense = function() {
    Memory.world.mil = Memory.world.mil || {}
    Memory.world.mil.allies = Memory.world.mil.allies || {}
    this.memory = Memory.world.mil;
};

Defense.prototype.doRoom = function(room, parent) {
    if (!room) { return ERR_INVALID_ARGS; }

    room.memory.defense = room.memory.defense || {}

    let defense = room.memory.defense;

    if (!defense.sleep || defense.sleep < Game.time) {
        if (room.controller && room.controller.my) {
            this.doSafeMode(room);
            this.spawnMilitia(room);
        }

        this.doDefenseMode(room, parent);

        defense.sleep = Game.time + C.DEFENSE_SLEEP;
    }

    return true;
};

Defense.prototype.spawnMilitia = function(room) {
    let defense = room.memory.defense;

    let maxCreep = 0;

    switch (room.controller.level) {
        case 1:
        case 2:
        case 3:
            break;

        case 4:
        case 5:
        case 6:
            maxCreep = 1;
            break;

        case 7:
        case 8:
            maxCreep = 2;
            break;
    }

    // spawn brawlers for the militia
    let count = _.filter(Game.creeps, creep =>
        creep.memory.spawnRoom == room.name &&
        creep.memory.role == C.COMBAT_MILITIA &&
        creep.memory.squad == 'militia' &&
        creep.memory.despawn != true
        ).length;

    if (count < maxCreep) {
        if (defense.spawnJob && !Game.Queue.getRecord(defense.spawnJob)) {
            defense.spawnJob = undefined;
        }

        if (!defense.spawnJob) {
            let record = {
                rooms: [ room.name, ],
                role: C.COMBAT_MILITIA,
                priority: 38,
                creepArgs: {
                    squad: 'militia',
                    task: C.TASK_MILITIA,
                },
            };

            defense.spawnJob = Game.Queue.spawn.addRecord(record);
        }
    }

    return true;
};

Defense.prototype.doDefenseMode = function(room, parent) {
    let defense = room.memory.defense;

    let targets = room.getHostiles();

    targets = _.filter(targets, creep =>
        creep.owner &&
        !Game.Mil.isAlly(creep.owner.username)
    );

    if (targets.length <= 0) {
        if (defense.active == 1) {
            defense.cooldown = defense.cooldown || Game.time;

            if ((defense.cooldown + C.DEFENSE_COOLDOWN) < Game.time) {
                defense.active = 0;

                Game.Queue.delRecord(defense.jobId);

                defense.jobId = undefined;
            }
        }

        return true;
    }

    defense.cooldown = defense.cooldown != undefined ? undefined : defense.cooldown;

    if (defense.active != 1) {
        defense.tick = Game.time;
        defense.active = 1;
        defense.creepLimit = 1;

        logger.info('defense mode activated in room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>');
    }

    let creepLimit = Math.ceil((Game.time - defense.tick) / C.DEFENSE_LIMIT_INCREASE_DELAY);

    if (defense.creepLimit < creepLimit) {
        defense.creepLimit = creepLimit;
    }

    if (!parent) {
        parent = room;
    }

    if (!defense.jobId || !Game.Queue.getRecord(defense.jobId)) {
        let record = {
            workRooms: [ room.name, ],
            spawnRoom: parent.name,
            task: C.WORK_DEFENSE,
            priority: 10,
        };

        defense.jobId = Game.Queue.work.addRecord(record);
    }

    let task = Game.Queue.getRecord(defense.jobId);

    if (defense.creepLimit > task.creepLimit) {
        task.creepLimit = defense.creepLimit;
    }

    return true;
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

        logger.info('safe mode activated in room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>');
    }

    return true;
};

module.exports = Defense;
