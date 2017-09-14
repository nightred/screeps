/*
 * task Sign Controller
 *
 * sign's the rooms controller
 *
 */

var taskSignController = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    run: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (creep.room.name != task.workRoom) {
            creep.moveToRoom(task.workRoom);
            return true;
        }

        if (!creep.room.controller) {
            task.completed = true;
            return;
        }

        if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
            let args = {
                range: 1,
                reusePath: 30,
                maxRooms: 1,
            };

            creep.goto(creep.room.controller, args);
            return true;
        }

        creep.signController(creep.room.controller, task.message)

        task.completed = true;
        return;
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        if (!room) { return ERR_INVALID_ARGS; }

        let record = {
            workRoom: args.roomName,
            message: args.message,
            task: C.WORK_SIGNCONTROLLER,
            priority: 99,
            creepLimit: 1,
        };

        return addQueueRecordWork(record);
    },

    /**
    * @param {roomName} roomName the room name
    * @param {Args} Args Array of values from flag
    **/
    flag: function(roomName, args) {
        if (!roomName) { return ERR_INVALID_ARGS; }

        let record = {
            roomName: roomName,
            message: args[2]
        }

        return this.create(record);
    },

};

registerWork(C.WORK_SIGNCONTROLLER, taskSignController);
