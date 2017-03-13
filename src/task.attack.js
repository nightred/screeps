/*
 * task Attack
 *
 * attack travels to a room and destroys all items in it
 *
 */

var taskAttack = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (task.workRooms.length <= 0) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let targets = creep.room.getHostiles();
        if (targets.length > 0) {
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));

            if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], { reusePath: 5, visualizePathStyle: {
                    fill: 'transparent',
                    stroke: '#990000',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1,
                }, });
            }
            return true;
        }
        targets = creep.room.getHostileSpawns()
        if (targets.length > 0) {
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));

            if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], { reusePath: 50, visualizePathStyle: {
                    fill: 'transparent',
                    stroke: '#ff1919',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1,
                }, });
            }
            return true;
        }
        targets = creep.room.getHostileStructures()
        if (targets.length > 0) {
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));

            if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], { reusePath: 50, visualizePathStyle: {
                    fill: 'transparent',
                    stroke: '#ec891d',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1,
                }, });
            }
            return true;
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return -1; }
        // task creation for the room
    },

};

module.exports = taskAttack;
