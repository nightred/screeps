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
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }
        // run creep task
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }

        if (!task.init) {
            this.printConfig(task);
            task.init = 1;
        }

        if (!task.spawnRoom) {
            return true;
        }

        if (Game.Manage.task.cooldown(task)) { return true; }

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
                if (!Game.Queue.work.isQueued({ targetId: sources[s].id, })) {
                    let record = {
                        workRooms: [ task.workRooms[0], ],
                        spawnRoom: task.spawnRoom,
                        task: C.MINE,
                        priority: 40,
                        creepLimit: 1,
                        managed: true,
                        targetId: sources[s].id,
                    };
                    Game.Queue.work.addRecord(record);
                }
            }
        }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }
        // task creation for the room
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }
        let record = {
            workRooms: [ room, ],
            task: C.DIRECTOR_MINE,
            priority: 21,
            creepLimit: 0,
            managed: true,
        };
        return Game.Queue.work.addRecord(record);
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    printConfig: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }

        let output = ""
        output += task.task + " task config, id " + task.id + "\n";

        output += "Game.Queue.queue[" + task.id + "].workRooms = [" + task.workRooms + "]\n";
        output += "Game.Queue.queue[" + task.id + "].spawnRoom = '" + task.spawnRoom + "'\n";

        output += "Update the records for operation.";

        console.log(output);
        return true;
    },

};

module.exports = taskDirectorMine;
