/*
 * task Militia
 *
 * task Militia defends rooms
 *
 */

var taskMilCombat = function() {
    // init
};

taskMilCombat.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) {
        return;
    }

    switch(creep.memory.role) {
        case C.ROLE_COMBAT_MEDIC:
            this.doHeal(creep);
            break;
        default:
            this.doAttack(creep);
    }
};

taskMilCombat.prototype.doAttack = function(creep) {
    creep.memory.targetId = creep.memory.targetId || false;

    if (!creep.memory.targetId) {
        creep.memory.targetId = this.getTarget(creep);
    }

    let target = Game.getObjectById(creep.memory.targetId);
    if (!target) {
        creep.memory.targetId = false;
        return this.doRally(creep);
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

taskMilCombat.prototype.doHeal = function(creep) {
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

taskMilCombat.prototype.getTarget = function(creep) {
    let targets = creep.room.getHostileStructures()
    targets = _.filter(targets, target =>
        target.structureType == STRUCTURE_TOWER);
    targets = _.filter(targets, structure =>
        structure.owner &&
        !isAlly(structure.owner.username));

    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    targets = creep.room.getHostiles();
    targets = _.filter(targets, creep =>
        creep.owner &&
        !isAlly(creep.owner.username));

    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    targets = creep.room.getHostileSpawns()
    targets = _.filter(targets, structure =>
        structure.owner &&
        !isAlly(structure.owner.username));

    if (targets.length > 0) {
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    targets = creep.room.getHostileStructures()
    targets = _.filter(targets, structure =>
        structure.owner &&
        !isAlly(structure.owner.username));

    if (targets.length > 0) {
        targets = _.filter(targets, target =>
            target.structureType != STRUCTURE_CONTROLLER);
        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        return targets[0];
    }

    return false;
};

taskMilCombat.prototype.doRally = function(creep) {
    creep.moveToIdlePosition();
};

registerProcess(C.TASK_MIL_COMBAT, taskMilCombat);
