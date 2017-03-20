/*
 * task Defense
 *
 * repair defense handles spawning combat creeps when under attack
 *
 */

var taskRepair = {

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

        task.manageTick = task.manageTick || 0;
        if ((task.manageTick + C.MANAGE_WAIT_TICKS) > Game.time) {
            return true;
        }
        task.manageTick = Game.time;

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

        task.spawnDelay = task.spawnDelay || Game.time;
        if ((task.spawnDelay + C.DEFENSE_SPAWN_DELAY) > Game.time) {
            return true;
        }

        if (task.creeps.length >= task.creepLimit) {
            return true;
        }

        if (!Game.Queue.spawn.isQueued({ room: task.spawnRoom, role: 'combat.brawler', })) {
            let record = {
                rooms: [ task.spawnRoom, ],
                role: 'combat.brawler',
                priority: 10,
                creepArgs: {
                    workRooms: task.workRooms,
                },
            };
            Game.Queue.spawn.addRecord(record);
        }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room, args) {
        if (!room) { return -1; }
        args = args || {};

        room.memory.findTickDefense = room.memory.findTickDefense || 0;
        if ((room.memory.findTickDefense + C.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTickDefense = Game.time;

        let targets = room.getHostiles();

        if (targets.length <= 0) { return true; }

        if (Game.Queue.work.isQueued({ task: 'defense', room: room.name, })) {
            return true;
        }

        args.spawnRoom = args.spawnRoom || room.name;
        let record = {
            workRooms: [ room.name, ],
            spawnRoom: args.spawnRoom,
            task: 'defense',
            managed: true,
            priority: 10,
            creepLimit: 1,
        };
        Game.Queue.work.addRecord(record);

        return true;
    },

};

module.exports = taskRepair;
