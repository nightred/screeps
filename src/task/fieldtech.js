/*
 * task Field Tech
 *
 * Field Tech is support for rooms without controllers or spawn ability
 * they self harvest the room and build or upgrade
 *
 */

var taskFieldTech = {

    /**
    * @param {Creep} creep The creep object
    **/
    run: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

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

        return true;
    },

    /**
    * @param {Creep} creep
    **/
    doWork: function(creep) {
        if (!creep.hasWork()) {
            let workTasks = [
                C.WORK_CONSTRUCTION,
                C.WORK_SIGNCONTROLLER,
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

    /**
    * @param {Creep} creep
    **/
    doMine: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (!creep.memory.harvestTarget) {
            let sources = creep.room.getSources();

            if (sources.length <= 0) {
                return true;
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

        return true;
    },

};

module.exports = taskFieldTech;
