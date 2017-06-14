/*
 * Defense system
 *
 * defense provides monitoring of rooms for invaders (npc or player)
 * and respondes to the threats
 *
 */

var Defense = function() {
    Memory.world.mil = Memory.world.mil || {}
    Memory.world.mil.allies = Memory.world.mil.allies || {}
    this.memory = Memory.world.mil;
};

Defense.prototype.doRoom = function(room) {
    if (!room) { return -1; }

    if (!room.controller || (room.controller &&
        ((!room.controller.my && room.controller.owner) ||
        (room.controller.reservation &&
        !room.controller.reservation.username == C.USERNAME)))) {
        return true;
    }

    if (room.controller && room.controller.my) {
        this.doSafeMode(room);
        this.spawnMilitia(room);
    }

    this.doDefenseMode(room);

    return true;
};

Defense.prototype.spawnMilitia = function(room) {
    if (!room) { return -1; }

    let brawlerCount = 0;
    switch (room.controller.level) {
        case 1:
            break;
        case 2:
        case 3:
        case 4:
        case 5:
            brawlerCount = 1;
            break;
        case 6:
        case 7:
        case 8:
            brawlerCount = 2;
            break;
    }

    // spawn brawlers for the militia
    let count = _.filter(Game.creeps, creep =>
        creep.memory.spawnRoom == room.name &&
        creep.memory.role == C.COMBAT_BRAWLER &&
        creep.memory.squad == 'militia' &&
        creep.memory.despawn != true
        ).length;

    if (count < brawlerCount) {
        if (!Game.Queue.spawn.isQueued({ room: room.name, role: C.COMBAT_BRAWLER, })) {
            let record = {
                rooms: [ room.name, ],
                role: C.COMBAT_BRAWLER,
                priority: 38,
                creepArgs: {
                    squad: 'militia',
                },
            };

            Game.Queue.spawn.addRecord(record);
        }
    }
};

Defense.prototype.doDefenseMode = function(room) {
    if (!room) { return -1; }

    room.memory.defense = room.memory.defense || {}
    let defense = room.memory.defense;

    defense.findTick = defense.findTick || 0;
    if ((defense.findTick + C.FIND_WAIT_TICKS) > Game.time) {
        return true;
    }
    defense.findTick = Game.time;

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
                Game.Queue.work.delRecord(defense.jobId);
                defense.jobId = undefined;
            }
        }

        return true;
    }

    defense.cooldown = defense.cooldown != undefined ? undefined : defense.cooldown;

    if (defense.active == 0) {
        defense.tick = Game.time;
        defense.active = 1;
        defense.creepLimit = 1;

        if (C.DEBUG >= 1) { console.log('INFO - defense mode activated in room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>'); }
    }

    let creepLimit = Math.ceil((Game.time - defense.tick) / C.DEFENSE_LIMIT_INCREASE_DELAY);
    defense.creepLimit = defense.creepLimit >= creepLimit ? defense.creepLimit : creepLimit;

    if (!defense.jobId) {
        let record = {
            workRooms: [ room.name, ],
            task: C.DEFENSE,
            priority: 10,
            creepLimit: 0,
        };

        defense.jobId = Game.Queue.work.addRecord(record);
    }

    let task = Game.Queue.getRecord(defense.jobId);

    if (!task) {
        defense.jobId = undefined;
        return true;
    }

    if (defense.creepLimit > task.creepLimit) {
        task.creepLimit = defense.creepLimit;
    }

    return true;
};

Defense.prototype.doSafeMode = function(room) {
    if (!room) { return -1; }

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
        room.controller.safeModeAvailable > 1) {
        room.controller.activateSafeMode();
        if (C.DEBUG >= 1) { console.log('INFO - safe mode activated in room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>'); }
    }

    return true;
};

module.exports = Defense;
