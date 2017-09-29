/*
 * task Dismantle
 *
 * Dismantle deconstructs buildings
 * deposits the refund in spawn room storage
 *
 */

var taskDismantle = function() {
    // init
};

taskDismantle.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) {
        return;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.manageState()) {
        if (creep.isWorking()) {
            creep.say('⚙');

            creep.memory.harvestTarget = false;
        } else {
            creep.say('🔋');

            creep.leaveWork();
        }
    }

    if (creep.isWorking()) {
        this.doWork(creep);
    } else {
        this.doStore(creep);
    }
};

/**
* @param {Creep} creep
**/
taskDismantle.prototype.doWork = function(creep) {
    if (!creep.hasWork()) {
        let workTasks = [
            C.WORK_DISMANTLE,
        ];

        if (!creep.getWork(workTasks)) {
            creep.sleep();
            creep.say('💤');

            return;
        }
    }

    creep.doWork();
};

/**
* @param {Creep} creep
**/
taskDismantle.prototype.doStore = function(creep) {
    if (creep.room.name != creep.memory.spawnRoom) {
        creep.moveToRoom(creep.memory.spawnRoom);
        return;
    }

    let energyTargets = [
        'storage',
        'container',
    ];

    creep.doEmpty(energyTargets, RESOURCE_ENERGY);
};

registerProcess(C.JOB_DISMANTLE, taskDismantle);
