/*
 * Mil Creep system
 *
 * mil Creep provides functions for military creep
 *
 */

var milCreep = function() {
    Memory.world = Memory.world || {};
    Memory.world.mil = Memory.world.mil || {}
    this.memory = Memory.world.mil;
};

milCreep.prototype.doCreep(creep, squad) {
    if (!creep) { return ERR_INVALID_ARGS; }
    if (!squad) { return ERR_INVALID_ARGS; }

    if (creep.room.name != squad.op.room) {
        creep.moveToRoom(squad.op.room);
        return true;
    }

    switch(creep.memory.role) {
        case C.COMBAT_MEDIC:
            this.doHeal(creep, squad);
            break;
        default:
            this.doAttack(creep, squad);
    }

    return true;
};

milCreep.prototype.doAttack = function(creep, squad) {
    if (!creep) { return -1; }
    if (!squad) { return -1; }

    creep.memory.targetId = creep.memory.targetId || false;

    if (!creep.memory.targetId) {
        creep.memory.targetId = this.getTarget(creep);
    }

    let target = Game.getObjectById(creep.memory.targetId);
    if (!target) {
        creep.memory.targetId = false;
        return this.doRally(creep, squad);
    }

    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
        let args = {
            reusePath: 10,
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            maxRooms: 1,
            visualizePathStyle: {
                fill: 'transparent',
                stroke: '#ff1919',
                lineStyle: 'dashed',
                strokeWidth: .15,
                opacity: .2,
            },
        };

        if (!target.StructureType) {
            args.reusePath = 1;
        }

        creep.goto(target, args);
    }

    return true;
};

milCreep.prototype.doHeal = function(creep, squad) {
    if (!creep) { return -1; }
    if (!squad) { return -1; }

    let targets = _.sortBy(_.filter(creep.room.find(FIND_MY_CREEPS), creep =>
        creep.hits < creep.hitsMax
        ), creep => creep.hits);

    if (targets.length <= 0) {
        return this.doRally(creep, squad);
    }

    targets = _.sortBy(targets, target => creep.pos.getRangeTo(target.pos));
    if (creep.heal(targets[0]) == ERR_NOT_IN_RANGE) {
        creep.goto(targets[0], { range: 1, reUsePath: 4, ignoreCreeps: true, });
        creep.rangedHeal(targets[0]);
    }

    return true;
};

milCreep.prototype.getTarget = function(creep) {
    if (!creep) { return -1; }

    let targets = creep.room.getHostileStructures()
    targets = _.filter(targets, target =>
        target.structureType == STRUCTURE_TOWER);
    targets = _.filter(targets, structure =>
        structure.owner &&
        !Game.Mil.isAlly(structure.owner.username));
    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }
    targets = creep.room.getHostiles();
    targets = _.filter(targets, creep =>
        creep.owner &&
        !Game.Mil.isAlly(creep.owner.username));
    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }
    targets = creep.room.getHostileSpawns()
    targets = _.filter(targets, structure =>
        structure.owner &&
        !Game.Mil.isAlly(structure.owner.username));
    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }
    targets = creep.room.getHostileStructures()
    targets = _.filter(targets, structure =>
        structure.owner &&
        !Game.Mil.isAlly(structure.owner.username));
    if (targets.length > 0) {
        targets = _.filter(targets, target =>
            target.structureType != STRUCTURE_CONTROLLER);
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    return false;
};

milCreep.prototype.doRally = function(creep, squad) {
    if (!creep) { return -1; }
    if (!task) { return -1; }

    if (squad.op) {
        let rallyPos = new RoomPosition(squad.op.x, squad.op.y, squad.op.room);

        creep.goto(rallyPos, { reusePath: 5, maxRooms: 1, });
    } else {
        creep.moveToIdlePosition();
    }
    return true;
};

module.exports = milCreep;
