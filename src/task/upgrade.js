/*
 * task Upgrade
 *
 * upgrade the room controller
 *
 */

var taskUpgrade = {

    /**
    * @param {Creep} creep The creep object
    **/
    run: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('📡');
            } else {
                creep.say('🔋');
            }
        }

        if (creep.memory.working) {
            this.doWork(creep);
        } else {
            this.withdrawEnergy(creep);
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    doWork: function(creep) {
        if (!creep.pos.inRangeTo(creep.room.controller, 3)) {
            let args = {
                range: 1,
                reusePath: 30,
                maxRooms: 1,
            };
            creep.goto(creep.room.controller, args);
            return true;
        }

        creep.upgradeController(creep.room.controller)

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    withdrawEnergy: function(creep) {
        let targets = [
            'linkOut',
            'containerOut',
            'container',
        ];

        if (!creep.room.storage ||
            (creep.room.controller && creep.room.controller.my &&
            creep.room.controller.level < 4)) {
            targets.push('extention');
            targets.push('spawn');
        }

        creep.doFill(targets, RESOURCE_ENERGY);

        return true;
    },

};

module.exports = taskUpgrade;
