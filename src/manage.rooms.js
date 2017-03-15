/*
 * Rooms managment
 *
 * runs proccesses to manage each room
 *
 */

// managment modules
var manageTower     = require('manage.tower');

var manageRooms = {

    doManage: function() {

        for (let name in Game.rooms) {
            if (!Game.rooms[name].controller) { continue; }
            if (Game.rooms[name].controller.my) {
                let room = Game.rooms[name];

                this.doContainers(room);
                Game.Queues.work.doTaskFind(room);
                Game.Queues.spawn.doSpawn(room);
                manageTower.run(room);
            }
        }

        return true;
    },

    doContainers: function(room) {
        if (!room) {return false; }

        if (room.memory.containersMemory < (Game.time - 20) || !room.memory.containersMemory) {
            for (let containerId in room.memory.structureContainers) {
                if (!Game.getObjectById(containerId)) {
                    delete room.memory.structureContainers[containerId];
                    if (C.DEBUG >= 1) { console.log('INFO - clearing non-existant container: ' + containerId); }
                }
            }

            var targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                }
            });

            for (let target of targets) {
                if (!target.memory.type) {
                    target.memory.type = 'default';
                }
            }

            room.memory.containersMemory = Game.time;
        }
    },

}

module.exports = manageRooms;
