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
            if (Constant.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let targets = creep.room.getHostiles();
        if (!targets) { return creep.removeWork(); }
        targets = _.sortBy(targets, target => target.hits);

        if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { range: 1, reusePath: 0, });
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        task.manageTick = task.manageTick || 0;
        if ((task.manageTick + Constant.MANAGE_WAIT_TICKS) > Game.time) {
            return true;
        }
        task.manageTick = Game.time;

        if (task.workRooms.length <= 0) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (!Game.rooms[task.workRooms[0]]) {
            if (Constant.DEBUG >= 3) { console.log('VERBOSE - no eyes on room: ' + task.workRooms[0] + ', task: ' + task.task + ', id: ' + task.id); }
            return true;
        }

        if (task.creeps.length >= task.creepLimit) {
            return true;
        }

        if (!Game.Queues.spawn.isQueued({ room: task.spawnRoom, role: 'combat.brawler', })) {
            let record = {
                rooms: [ task.spawnRoom, ],
                role: 'combat.brawler',
                priority: 10,
                creepArgs: {
                    workRooms: task.workRooms,
                },
            };
            Game.Queues.spawn.addRecord(record);
        }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room, args) {
        if (!room) { return -1; }
        args = args || {};

        Memory.world.tasks = Memory.world.tasks || {};
        Memory.world.tasks.repair = Memory.world.tasks.repair || {};
        let mem = Memory.world.tasks.repair;
        mem.findTick = mem.findTick || 0;
        if ((mem.findTick + Constant.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        mem.findTick = Game.time;

        let targets = room.getHostiles();

        if (targets.length <= 0) { return true; }

        if (Game.Queues.work.isQueued({ task: 'defense', room: room.name, })) {
            return true;
        }

        args.spawnRoom = args.spawnRoom || room.name;
        let record = {
            workRooms: [ room.name, ],
            spawnRoom: args.spawnRoom,
            task: 'defense',
            priority: 10,
            creepLimit: 6,
        };
        Game.Queues.work.addRecord(record);

        return true;
    },

};

module.exports = taskRepair;
