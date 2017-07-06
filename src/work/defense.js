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

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let targets = creep.room.getHostiles();
        if (!targets || targets.length <= 0) { return creep.removeWork(); }

        targets = _.filter(targets, creep =>
            creep.owner &&
            !Game.Mil.isAlly(creep.owner.username)
        );

        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));

        if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { reusePath: 0, });
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        if (Game.rooms[task.workRooms[0]].getHostiles().length <= 0) {
            task.cooldown = task.cooldown || Game.time;
            if ((task.cooldown + C.DEFENSE_COOLDOWN) < Game.time) {
                Game.Queue.work.delRecord(task.id);
                return true;
            }
        }

        let creepLimit = Math.ceil((Game.time - task.tick) / C.DEFENSE_LIMIT_INCREASE_DELAY);
        task.creepLimit = task.creepLimit >= creepLimit ? task.creepLimit : creepLimit;

        return true;
    },

};

module.exports = taskDefense;
