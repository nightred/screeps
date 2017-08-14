/*
 * task Defense
 *
 * repair defense handles spawning combat creeps when under attack
 *
 */

var taskDefense = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    run: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (creep.room.name != task.workRoom) {
            creep.moveToRoom(task.workRoom);
            return true;
        }

        let targets = creep.room.getHostiles();
        if (!targets || targets.length <= 0) { return creep.removeWork(); }

        targets = _.filter(targets, creep =>
            creep.owner &&
            !Game.Mil.isAlly(creep.owner.username)
        );

        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
        let target = targets[0];

        if (!creep.pos.inRangeTo(targets[0], 1)) {
            creep.moveTo(targets[0], {
                reusePath: 0,
                maxRooms: 1,
            });
        } else {
            creep.attack(targets[0]);
        }

        if (creep.getActiveBodyparts(HEAL)) {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        }

        return true;
    },

};

module.exports = taskDefense;
