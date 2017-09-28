/*
 * task Tech
 *
 * handles the spawning od tech units
 *
 */

var taskTech = function() {
    // init
};

_.merge(taskTech.prototype, require('lib.spawncreep'));

taskTech.prototype.run = function() {
    this.doCreepSpawn();

    for (let i = 0; i < this.memory.creeps.length; i++) {
        let creep = Game.creeps[this.memory.creeps[i]];
        if (!creep) continue;
        this.doCreepActions(creep);
    }
};

/**
* @param {Creep} creep The creep object
**/
taskTech.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
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
        } else {
            creep.say('📋');
        }
    }

    creep.doWork();
};

registerProcess('tasks/tech', taskTech);
