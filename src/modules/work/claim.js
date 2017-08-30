/*
 * task Claim
 *
 * task claim travels to a room and claims the controller
 *
 */

var taskClaim = {

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

        if (!creep.room.controller || creep.room.controller.my) {
            return creep.removeWork();
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

        creep.claimController(creep.room.controller)
        return true;
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        let record = {
            workRoom: args.roomName,
            task: C.WORK_CLAIM,
            priority: 40,
            creepLimit: 1,
        };

        return Game.Queue.work.addRecord(record);
    },

    /**
    * @param {roomName} roomName the room name
    * @param {Args} Args Array of values from flag
    **/
    flag: function(roomName, args) {
        if (!roomName) { return ERR_INVALID_ARGS; }

        let record = {
            roomName: roomName,
        }

        return this.create(record);
    },

};

registerWork(C.WORK_CLAIM, taskClaim);
