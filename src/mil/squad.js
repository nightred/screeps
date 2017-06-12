/*
 * Squad system
 *
 * squad provides military conrol of unit groups
 *
 */

var Squad = function() {
    Memory.world.mil = Memory.world.mil || {}
    this.memory = Memory.world.mil;
};

Squad.prototype.doSquad = function(squad) {
    if (!squad) { return ERR_INVALID_ARGS; }

    squad.cooldownCreep = squad.cooldownCreep || 0;
    if (squad.cooldownCreep < Game.time) {
        squad.cooldownCreep = Game.time + C.MIL_SQUAD_CREEP_COOLDOWN;
        squad.creeps = this.getSquadCreep(squad.squad);
    }

    for (let i = 0; i < squad.creeps.length; i++) {
        let creep = Game.creeps[squad.creeps[i]];
        Game.Mil.creep.doCreep(creep. squad);
    }

};

Squad.prototype.getSquadCreep = function(squadName) {
    if (!squadName) { return ERR_INVALID_ARGS; }

    return _.filter(Game.creeps, c => c.memory.squad == squadName)
    .map(c => c.name);
}

Squad.prototype.doSpawn = function(flag, args) {
    if (!flag) { return ERR_INVALID_ARGS; }
    if (!args.squad) { return ERR_INVALID_ARGS; }
    if (C.ROLE_TYPES.indexOf(args.role) == -1) { return ERR_INVALID_ARGS; }
    if (isNaN(args.count)) { return ERR_INVALID_ARGS; }

    // cooldown on spawn checks
    flag.cooldown = flag.cooldown || 0;
    if (flag.cooldown > Game.time) {
        return true;
    }
    flag.cooldown = Game.time + C.MIL_SQUAD_SPAWN_COOLDOWN;

    let roomName = flag.pos.roomName;

    // spawn new creeps if needed
    let count = _.filter(Game.creeps, creep =>
        creep.memory.squad == args.squad &&
        creep.memory.role == args.role &&
        creep.memory.spawnRoom == roomName &&
        creep.memory.despawn != true
        ).length;

    // check if we need to spawn
    if (count >= args.count) {
        return true;
    }

    if (Game.Queue.spawn.isQueued({
        room: roomName,
        role: args.role,
    })) {
        return true;
    }

    let record = {
        rooms: [ room.name, ],
        role: args.role,
        priority: 42,
        creepArgs: {
            squad: args.squad,
        },
    };

    Game.Queue.spawn.addRecord(record);

    return true;
};

Squad.prototype.updateRally = function(flag) {
    let squad = Game.Queue.mil.getSquad(flag.name);
    if (!squad) {
        return false;
    }

    squad.op.room = squad.op.room = flag.pos.roomName ? flag.pos.roomName : squad.op.room;
    squad.op.x = squad.op.x != flag.pos.x ? flag.pos.x : squad.op.x;
    squad.op.y = squad.op.y != flag.pos.y ? flag.pos.y : squad.op.y;

    return true;
};

Squad.prototype.doSpawn = function(flag, args) {

};

module.exports = Squad;
