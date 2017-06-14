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
    doTask: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let targets = creep.room.getHostiles();
        if (!targets || targets.length <= 0) { return creep.removeWork(); }
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
        if (!task) { return ERR_INVALID_ARGS; }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room, args) {
        if (!room) { return ERR_INVALID_ARGS; }
        args = args || {};

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }
        return false;
    },

};

module.exports = taskDefense;
