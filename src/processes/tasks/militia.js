/*
 * task Militia
 *
 * task Militia defends rooms
 *
 */

var taskMilitia = function() {
    // init
};

taskMilitia.prototype.run = function() {
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

    if (!creep.hasWork()) {
        let workTasks = [
            C.WORK_DEFENSE,
        ];

        if (!creep.getWork(workTasks, {
            spawnRoom: creep.memory.spawnRoom
        })) {
            creep.sleep();
            creep.say('💤');

            return;
        }
    }

    creep.doWork();
};

registerProcess(C.TASK_MILITIA, taskMilitia);
