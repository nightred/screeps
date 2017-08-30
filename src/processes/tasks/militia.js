/*
 * task Militia
 *
 * task Militia defends rooms
 *
 */

var taskMilitia = {

    // Run the requested task
    run: function() {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            Game.kernel.killProcess(this.pid);
        }

        if (creep.getOffExit()) {
            return true;
        }

        if (creep.isSleep()) {
            creep.moveToIdlePosition();
            return true;
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

                return true;
            }
        }

        creep.doWork();

        return true;
    },

};

registerProcess('tasks/militia', taskMilitia);
