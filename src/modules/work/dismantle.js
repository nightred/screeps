/*
 * task Dismantle
 *
 * repair task handles repairing structures
 *
 */

var taskDismantle = {

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

        if (!task.pos) {
            return false;
        }

        if (!task.targetId) {
            let pos = new RoomPosition(task.pos.x, task.pos.y, task.pos.room);

            let structure = pos.getStructure();

            if (!structure) {
                return true;
            }

            task.targetId = structure.id;
        }

        let target = Game.getObjectById(task.targetId);

        if (!creep.pos.inRangeTo(target, 1)) {
            let args = {
                range: 1,
                reusePath: 50,
                maxRooms: 1,
            };

            creep.goto(target, args);
        } else {
            creep.dismantle(target)
        }

        return true;
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        let record = {
            workRoom: args.roomName,
            task: C.WORK_DISMANTLE,
            priority: 64,
            creepLimit: 1,
            targetId: args.targetId,
        };

        return addQueueRecordWork(record);
    },

    /**
    * @param {roomName} roomName the room name
    * @param {Args} Args Array of values from flag
    **/
    flag: function(roomName, args) {
        let record = {
            roomName: roomName,
        }

        return this.create(record);
    },

};

registerWork(C.WORK_DISMANTLE, taskDismantle);
