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
    run: function(creep, task) {
        if (creep.manageState()) {
            if (creep.isWorking()) {
                creep.say('🚛');
            } else {
                creep.say('📦');

                if (this.isComplete(creep.room)) {
                    task.completed = true;
                    return;
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
    },

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doEmptyTerminal: function(creep, task) {
        if (creep.room.name != task.workRoom) {
            creep.moveToRoom(task.workRoom);
            return true;
        }

        let terminal = Game.getObjectById(task.targetId);

        if (!terminal) {
            task.completed = true;
            return;
        }

        creep.doWithdraw(terminal, RESOURCE_ENERGY);

        return true;
    },

    /**
    * @param {Creep} creep The creep object
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

        creep.doEmpty(storeTargets, RESOURCE_ENERGY);

        return true;
    },

    isComplete: function(room) {
        let terminal = room.terminal;
        let maxEnergy = C.TERMINAL_ENERGY_MAX * terminal.storeCapacity;

        return terminal.store[RESOURCE_ENERGY] <= maxEnergy;
    },

    /**
    * @param {Room} room The room object
    **/
    find: function(room) {
        if (!room) { return ERR_INVALID_ARGS; }

        room.memory.work = room.memory.work || {};

        let memory = room.memory.work;

        if (memory.sleepTerminalEmpty && memory.sleepTerminalEmpty > Game.time) {
            return true;
        }
        memory.sleepTerminalEmpty = Game.time + C.WORK_FIND_SLEEP;

        if (!room.storage) {
            return true;
        }

        if (!room.terminal) {
            return true;
        }

        room.memory.terminal = room.memory.terminal || {};

        let jobId = room.memory.terminal.jobEmptyId;

        if (jobId && getQueueRecord(jobId)) {
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

        let args = {
            roomName: room.name,
            targetId: terminal.id,
        };

        room.memory.terminal.jobEmptyId = this.create(args);;

        return true;
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {

        let record = {
            workRoom: args.roomName,
            task: C.WORK_TERMINAL_EMPTY,
            priority: 80,
            creepLimit: 1,
            targetId: args.targetId,
        };

        return addQueueRecordWork(record);
    },

};

registerWork(C.WORK_TERMINAL_EMPTY, taskTerminalEmpty);
