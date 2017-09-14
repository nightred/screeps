/*
 * task Tech
 *
 * handles the spawning od tech units
 *
 */

var taskTech = function() {
    // init
};

taskTech.prototype.run = function() {
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
            C.WORK_REPAIR,
            C.WORK_TOWER_REFILL,
            C.WORK_CONSTRUCTION,
            C.WORK_SIGNCONTROLLER,
            C.WORK_TERMINAL_EMPTY,
        ];

        if (!creep.getWork(workTasks)) {
            creep.sleep();
            creep.say('💤');

            return;
        }
    }

    creep.doWork();
};

registerProcess('tasks/tech', taskTech);
