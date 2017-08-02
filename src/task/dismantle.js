/*
 * task Dismantle
 *
 * Dismantle deconstructs buildings
 * deposits the refund in spawn room storage
 *
 */

var taskDismantle = {

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

module.exports = taskDismantle;
