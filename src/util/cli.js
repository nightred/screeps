/*
 * Set variables for managment
 *
 * ACTIVE: controls run loop
 * DEBUG: Report on values at runtime
 *
 * ENERGY_* values set upper and lower usage values
 *
 * LIMIT_* values max creep spawn per room
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

            combatbrawler: function(room, count) {
                if (!room || isNaN(count)) {
                    console.log('ERROR - command need the following values: room name, count');
                    return false;
                }

                let record = {
                    rooms: [ room, ],
                    role: C.COMBAT_BRAWLER,
                    priority: 80,
                };

                for (let i = 0; i < count; i++) {
                    Game.Queue.spawn.addRecord(record);
                }

                return true;
            },

            combatswarm: function(room, count) {
                if (!room || isNaN(count)) {
                    console.log('ERROR - command need the following values: room name, count');
                    return false;
                }

                let record = {
                    rooms: [ room, ],
                    role: C.COMBAT_SWARMER,
                    priority: 80,
                };

                for (let i = 0; i < count; i++) {
                    Game.Queue.spawn.addRecord(record);
                }

                return true;
            },

            combatmedic: function(room, count) {
                if (!room || isNaN(count)) {
                    console.log('ERROR - command need the following values: room name, count');
                    return false;
                }

                let record = {
                    rooms: [ room, ],
                    role: C.COMBAT_MEDIC,
                    priority: 80,
                };

                for (let i = 0; i < count; i++) {
                    Game.Queue.spawn.addRecord(record);
                }

                return true;
            },

        },

    },

    queue: {

        remove: function(id) {
            if (isNaN(id)) {
                console.log('ERROR - command need the following values: work id');
                return false;
            }

            return Game.Queue.delRecord(id);
        },

    },

    work: {

        reserve: function(room, spawn) {
            if (!room || !spawn) {
                console.log('ERROR - command need the following values: work room, spawn room');
                return false;
            }
            let record = {
                workRooms: [ room, ],
                spawnRoom: spawn,
                task: C.WORK_RESERVE,
                managed: true,
                priority: 70,
                creepLimit: 0,
            };

            return Game.Queue.work.addRecord(record);
        },

        claim: function(room) {
            if (!room) {
                console.log('ERROR - command need the following values: room name');
                return false;
            }
            let record = {
                workRooms: [ room, ],
                task: C.WORK_CLAIM,
                priority: 20,
                creepLimit: 1,
            };

            return Game.Queue.work.addRecord(record);
        },

        scouting: function(room) {
            if (!room) {
                console.log('ERROR - command need the following values: room name');
                return false;
            }
            let record = {
                workRooms: [ room, ],
                task: C.WORK_SCOUTING,
                priority: 90,
                creepLimit: 1,
            };

            return Game.Queue.work.addRecord(record);
        },

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

        signcontroller: function(roomName, message) {
            if (!roomName || !message) {
                console.log('ERROR - command need the following values: room name, message');
                return false;
            }
            let record = {
                workRooms: [ roomName, ],
                task: C.WORK_SIGNCONTROLLER,
                priority: 40,
                creepLimit: 1,
                message: message,
            };

            return Game.Queue.work.addRecord(record);
        },

        haul: function(roomName, spawnRoom) {
            if (!roomName) {
                console.log('ERROR - command need the following values: work room, (opt) spawn room');
                return false;
            }
            spawnRoom = spawnRoom || roomName;
            let record = {
                workRooms: [ roomName, ],
                spawnRoom: spawnRoom,
                task: C.DIRECTOR_HAUL,
                priority: 22,
                creepLimit: 0,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

        longhaul: function(roomName, spawnRoom) {
            if (!roomName || !spawnRoom) {
                console.log('ERROR - command need the following values: work room, spawn room');
                return false;
            }
            let record = {
                workRooms: [ roomName, ],
                spawnRoom: spawnRoom,
                task: C.DIRECTOR_LONGHAUL,
                priority: 40,
                creepLimit: 0,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

        upgrade: function(roomName, spawnRoom) {
            if (!roomName) {
                console.log('ERROR - command need the following values: work room, (opt) spawn room');
                return false;
            }
            spawnRoom = spawnRoom || roomName;
            let record = {
                workRooms: [ roomName, ],
                spawnRoom: spawnRoom,
                task: C.UPGRADE,
                priority: 26,
                creepLimit: 1,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

        tech: function(roomName, spawnRoom) {
            if (!roomName) {
                console.log('ERROR - command need the following values: work room, (opt) spawn room');
                return false;
            }
            spawnRoom = spawnRoom || roomName;
            workRooms = Array.isArray(roomName) ? roomName : [ roomName ];
            let record = {
                workRooms: workRooms,
                spawnRoom: spawnRoom,
                task: C.DIRECTOR_TECH,
                priority: 30,
                creepLimit: 1,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

        crashtech: function(roomName, spawnRoom) {
            if (!roomName) {
                console.log('ERROR - command need the following values: work room, (opt) spawn room');
                return false;
            }
            spawnRoom = spawnRoom || roomName;
            workRooms = Array.isArray(roomName) ? roomName : [ roomName ];
            let record = {
                workRooms: workRooms,
                spawnRoom: spawnRoom,
                task: C.DIRECTOR_CRASHTECH,
                priority: 48,
                creepLimit: 1,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

        spawnRoom: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: room name');
                return false;
            }
            let record = {
                workRooms: [ roomName, ],
                spawnRoom: roomName,
                task: C.DIRECTOR_ROOM,
                priority: 20,
                creepLimit: 0,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

        mine: function(roomName, spawnRoom) {
            if (!roomName) {
                console.log('ERROR - command need the following values: work room, (opt) spawn room');
                return false;
            }
            spawnRoom = spawnRoom || roomName;
            let record = {
                workRooms: [ roomName, ],
                spawnRoom: spawnRoom,
                task: C.DIRECTOR_MINE,
                priority: 21,
                creepLimit: 0,
                managed: true,
            };

            return Game.Queue.work.addRecord(record);
        },

    },

}

module.exports = Cli;
