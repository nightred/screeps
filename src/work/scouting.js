/*
 * task Scouting
 *
 * mine scouting travels to a room and patrols
 *
 */

var taskScouting = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    run: function(creep, task) {
        if (!creep) { return ERR_INVALID_ARGS; }
        if (!task) { return ERR_INVALID_ARGS; }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        let targets = creep.room.getHostileConstructionSites();
        if (targets.length > 0) {
            creep.moveTo(targets[0].pos.x, targets[0].pos.y, { reusePath: 30, });
            return true;
        }

        task.position = task.position || 0;

        let x = 10;
        let y = 10;
        switch (task.position) {
            case 1:
                y = 40;
                break;
            case 2:
                x = 40;
                y = 40;
                break;
            case 3:
                x = 40;
        }
        let target = new RoomPosition(x, y, task.workRooms[0]);
        let args = {
            range: 6,
            reusePath: 30,
            visualizePathStyle: {
                fill: 'transparent',
                stroke: '#fff',
                lineStyle: 'dashed',
                strokeWidth: .15,
                opacity: .1,
            },
        }
        if (creep.moveTo(target, args) == ERR_NO_PATH) {
            task.position++;
            task.position = task.position < 4 ? task.position : 0;
        }

        return true;
    },

    /**
    * @param {Args} Args object with values for creation
    **/
    create: function(args) {
        let record = {
            workRooms: [ args.roomName, ],
            task: C.WORK_SCOUTING,
            priority: 90,
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

module.exports = taskScouting;
