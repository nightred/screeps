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
        if (!creep) { return -1; }
        if (!task) { return -1; }

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
        if (!task) { return -1; }

        if (Game.Manage.task.cooldown(task)) { return true; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (!Game.rooms[task.workRooms[0]]) {
            if (C.DEBUG >= 3) { console.log('VERBOSE - no eyes on room: ' + task.workRooms[0] + ', task: ' + task.task + ', id: ' + task.id); }
            return true;
        }

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

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room, args) {
        if (!room) { return -1; }
        args = args || {};

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return -1; }
        return false;
    },

};

module.exports = taskDefense;
