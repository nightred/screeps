/*
 * task Field Tech
 *
 * Field Tech is support for rooms without controllers or spawn ability
 * they self harvest the room and build or upgrade
 *
 */

var taskFieldTech = function() {
    // init
};

taskFieldTech.prototype.run = function() {
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
        this.doMine(creep);
    }
};

/**
* @param {Creep} creep
**/
taskFieldTech.prototype.doWork = function(creep) {
    if (!creep.hasWork()) {
        let workTasks = [
            C.WORK_CONSTRUCTION,
            C.WORK_SIGNCONTROLLER,
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
taskFieldTech.prototype.doMine = function(creep) {
    if (!creep.memory.harvestTarget) {
        let sources = creep.room.getSources();

        if (sources.length <= 0) {
            return;
        }

        sources = _.sortBy(sources, source => source.energy).reverse();

        creep.memory.harvestTarget = sources[0].id;
    }

    let source = Game.getObjectById(creep.memory.harvestTarget);

    if (!creep.pos.inRangeTo(source, 1)) {
        creep.goto(source, {
            range: 1,
            reUsePath: 80,
            ignoreCreeps: true,
        });
    } else {
        creep.harvest(source);
    }
};

registerProcess('tasks/fieldtech', taskFieldTech);
