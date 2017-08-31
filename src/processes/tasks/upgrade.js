/*
 * task Upgrade
 *
 * upgrade the room controller
 *
 */

var taskUpgrade = function() {
    // init
};

taskUpgrade.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
    }

    if (creep.getOffExit()) {
        return;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.manageState()) {
        if (creep.memory.working) {
            creep.say('📡');
        } else {
            creep.say('🔋');
        }
    }

    if (creep.memory.working) {
        this.doWork(creep);
    } else {
        this.withdrawEnergy(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskUpgrade.prototype.doWork = function(creep) {
    if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
        let args = {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
        };
        creep.goto(creep.room.controller, args);
        return;
    }

    creep.upgradeController(creep.room.controller)
};

/**
* @param {Creep} creep The creep object
**/
taskUpgrade.prototype.withdrawEnergy = function(creep) {
    let targets = [
        'linkOut',
        'containerOut',
        'container',
    ];

    if (!creep.room.storage ||
        (creep.room.controller && creep.room.controller.my &&
        creep.room.controller.level < 4)) {
        targets.push('extention');
        targets.push('spawn');
    }

    creep.doFill(targets, RESOURCE_ENERGY);
};

registerProcess('tasks/upgrade', taskUpgrade);
