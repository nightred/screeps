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

    if (room.controller &&
        ((!room.controller.my && room.controller.owner) ||
        (room.controller.reservation &&
        !room.controller.reservation.username == C.USERNAME))) {
        return true;
    }

    if (room.controller && room.controller.my) {
        this.doSafeMode(room);
    }
    this.doDefenseMode(room);

    return true;
};

Defense.prototype.doDefenseMode = function(room) {
    if (!room) { return -1; }

    room.memory.findTickDefense = room.memory.findTickDefense || 0;
    if ((room.memory.findTickDefense + C.FIND_WAIT_TICKS) > Game.time) {
        return true;
    }
    room.memory.findTickDefense = Game.time;

    let targets = room.getHostiles();
    if (targets.length <= 0) { return true; }
    for (let i = 0; i < targets.length; i++) {
        // allies test here
    }
    if (Game.Queue.work.isQueued({ task: C.DEFENSE, room: room.name, })) {
        return true;
    }

    let record = {
        workRooms: [ room.name, ],
        task: C.DEFENSE,
        managed: true,
        priority: 10,
        creepLimit: 1,
    };
    Game.Queue.work.addRecord(record);
    if (C.DEBUG >= 1) { console.log('INFO - defense mode activated in room: <p style=\"display:inline; color: #ed4543\"><a href=\"#!/room/' + room.name + '\">' + room.name + '</a></p>'); }

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
