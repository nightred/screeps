/*
 * task Terminal Empty
 *
 * Terminal Empty task handles removal of energy from terminal
 *
 */

var taskTerminalEmpty = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (creep.manageState()) {
            if (creep.isWorking()) {
                creep.say('🚛');
            } else {
                creep.say('📦');

                if (this.isComplete(creep.room)) {
                    creep.removeWork();

                    return true;
                }
            }
        }

        if (creep.isWorking()) {
            // creep full
            this.doStore(creep, task);
        } else {
            // creep empty
            this.doEmptyTerminal(creep, task);
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doEmptyTerminal: function(creep, task) {
        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let terminal = Game.getObjectById(task.targetId);

        if (!terminal) {
            return creep.removeWork();
        }

        creep.doWithdraw(terminal, RESOURCE_ENERGY);

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doStore: function(creep, task) {
        if (creep.memory.spawnRoom != creep.room.name) {
            creep.moveToRoom(creep.memory.spawnRoom);
            return true;
        }

        let storeTargets = [
            'storage',
        ];

        if (!creep.doEmpty(storeTargets, RESOURCE_ENERGY)) {
            if (C.DEBUG >= 2) { console.log('DEBUG - do empty failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return ERR_INVALID_ARGS; }
    },

    isComplete: function(room) {
        let terminal = room.terminal;
        let maxEnergy = C.TERMINAL_ENERGY_MAX * terminal.storeCapacity;

        return terminal.store[RESOURCE_ENERGY] <= maxEnergy;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }

        room.memory.findTerminalEmpty = room.memory.findTerminalEmpty || 0;
        if ((room.memory.findTerminalEmpty + C.FIND_WAIT_TICKS) > Game.time) {
            return true;
        }
        room.memory.findTerminalEmpty = Game.time;

        if (!room.storage) {
            return true;
        }

        if (!room.terminal) {
            return true;
        }

        room.memory.terminal = room.memory.terminal || {};

        let jobId = room.memory.terminal.jobEmptyId;

        if (jobId && Game.Queue.getRecord(jobId)) {
            return true;
        }

        if (jobId) {
            room.memory.terminal.jobEmptyId = false;
        }

        let terminal = room.terminal;
        let maxEnergy = C.TERMINAL_ENERGY_MAX * terminal.storeCapacity;

        if (terminal.store[RESOURCE_ENERGY] <= maxEnergy + 1000) {
            return true;
        }

        let record = {
            workRooms: [ room.name, ],
            spawnRoom: room.name,
            task: C.TERMINAL_EMPTY,
            priority: 80,
            creepLimit: 1,
            targetId: terminal.id,
        };

        jobId = Game.Queue.work.addRecord(record);

        room.memory.terminal.jobEmptyId = jobId;

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    createTask: function(args, room) {
        return false;
    },

};

module.exports = taskTerminalEmpty;
