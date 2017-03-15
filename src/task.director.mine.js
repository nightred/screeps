/*
 * task Director Mine
 *
 * director mine task handles the creation of mine tasks for the room
 * spawning of miner role creeps for mine tasks is controled here
 *
 */

var taskDirectorMine = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }
        // run creep task
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

        for (let i = 0; i < task.workRooms.length; i++ ) {
            if (!Game.rooms[task.workRooms[i]]) { continue; }
            let room = Game.rooms[task.workRooms[i]];

            let sources = room.getSources();
            if (sources.length <= 0) { continue; }
            for (let s = 0; s < sources.length; s++) {
                if (!Game.Queues.work.isQueued({ targetId: sources[s].id, })) {
                    let record = {
                        workRooms: [ task.workRooms[0], ],
                        spawnRoom: task.spawnRoom,
                        task: 'mine',
                        priority: 40,
                        creepLimit: 1,
                        managed: true,
                        targetId: sources[s].id,
                    };
                    Game.Queues.work.addRecord(record);
                }
            }
        }

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

module.exports = taskDirectorMine;
