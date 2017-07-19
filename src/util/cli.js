/*
 * CLI
 *
 */

var Cli = {

    creep: {

        despawn: function(creepName) {
            if (!creepName) {
                console.log('ERROR - command need the following values: creepName');
                return false;
            }

            if (!Game.creeps[creepName]) {
                console.log('ERROR - ' + creepName + ' is not a valid creep');
                return false;
            }

            Game.creeps[creepName].memory.despawn = true;
            console.log('RESULT - ' + creepName + ' has been set to despawn');

            return true;
        },

        spawn: {

            controller: function(room) {
                if (!room) {
                    console.log('ERROR - command need the following values: room name');
                    return false;
                }

                let record = {
                    rooms: [ room, ],
                    role: C.CONTROLLER,
                    priority: 30,
                };

                return Game.Queue.spawn.addRecord(record);
            },

            scout: function(room) {
                if (!room) {
                    console.log('ERROR - command need the following values: room name');
                    return false;
                }

                let record = {
                    rooms: [ room, ],
                    role: C.SCOUT,
                    priority: 80,
                };

                return Game.Queue.spawn.addRecord(record);
            },

        },

    },

    work: {

        attack: function(room, limit) {
            if (!room || isNaN(limit)) {
                console.log('ERROR - command need the following values: room name, creep limit');
                return false;
            }
            let record = {
                workRooms: [ room, ],
                task: C.WORK_ATTACK,
                priority: 40,
                managed: true,
                creepLimit: limit,
            };

            return Game.Queue.work.addRecord(record);
        },

    },

}

module.exports = Cli;
