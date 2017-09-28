/*
 * task Militia
 *
 * task Militia defends rooms
 *
 */

var taskMilitia = function() {
    // init
};

_.merge(taskMilitia.prototype, require('lib.spawncreep'));

taskMilitia.prototype.run = function() {
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
taskMilitia.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (!creep.hasWork()) {
        if (!creep.getWork([C.WORK_DEFENSE], {
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
