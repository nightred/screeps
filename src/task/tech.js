/*
 * task Tech
 *
 * handles the spawning od tech units
 *
 */

var taskTech = {

    /**
    * @param {Creep} creep The creep object
    **/
    run: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

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

                return true;
            }
        }

        creep.doWork();

        return true;
    },

};

module.exports = taskTech;
