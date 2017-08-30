/*
 * task Dismantle
 *
 * Dismantle deconstructs buildings
 * deposits the refund in spawn room storage
 *
 */

var taskDismantle = {

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

        return true;
    },

    /**
    * @param {Creep} creep
    **/
    doWork: function(creep) {

        if (!creep.hasWork()) {
            let workTasks = [
                C.WORK_DISMANTLE,
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
    doStore: function(creep) {
        if (creep.room.name != creep.memory.spawnRoom) {
            creep.moveToRoom(creep.memory.spawnRoom);
            return true;
        }

        let energyTargets = [
            'storage',
            'container',
        ];

        creep.doEmpty(energyTargets, RESOURCE_ENERGY);

        return true;
    },

};

registerProcess('tasks/dismantle', taskDismantle);
