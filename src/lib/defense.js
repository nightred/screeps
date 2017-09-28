/*
 * Library for defense of rooms
 */

var logger = new Logger('[Defense]');
logger.level = C.LOGLEVEL.DEBUG;

var libDefense = {

    doDefense: function() {
        let room = Game.rooms[this.memory.workRoom];
        if (!room) return;

        room.memory.defense = room.memory.defense || {}
        let defense = room.memory.defense;

        if (room.controller && room.controller.my) {
            this.doDefenseSafeMode(room);
        }

        if (this.memory.workRoom == this.memory.spawnRoom) {
            this.doSquadDefenseSpawnLimits();
        }

        this.doDefenseModeRoom(room);
    },

    doSquadDefenseSpawnLimits: function(room) {
        let spawnRoom = Game.rooms[this.memory.spawnRoom];
        if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) return;

        let creepLimit = 0;
        let minSize = 200;
        let maxSize = 200;

        let rlevel = spawnRoom.controller.level;
        if (rlevel == 2 || rlevel == 3) {
            minSize = 200;
            maxSize = 300;
            creepLimit = 1;
        } else if (rlevel == 4 || rlevel == 5 || rlevel == 6) {
            minSize = 200;
            maxSize = 500;
            creepLimit = 1;
        } else if (rlevel == 7) {
           minSize = 200;
           maxSize = 800;
           creepLimit = 1;
        } else if (rlevel == 8) {
            minSize = 400;
            maxSize = 9999;
            creepLimit = 2;
        }

        let process = Game.kernel.getProcessByPid(this.memory.militiaPid);
        if (!process) {
            process = Game.kernel.startProcess(this, C.TASK_MILITIA, {});
            if (!process) {
                logger.error('failed to create process ' + C.TASK_MILITIA);
                return;
            }
            this.memory.militiaPid = process.pid;
        }

        process.setSpawnDetails({
            spawnRoom: this.memory.spawnRoom,
            role: C.ROLE_COMBAT_MILITIA,
            priority: 38,
            maxSize: maxSize,
            minSize: minSize,
            limit: creepLimit,
            creepArgs: {
                workRooms: this.memory.workRoom,
            },
        });
    },

    doDefenseModeRoom: function(room) {
        let defense = room.memory.defense;

        let targets = room.getHostiles();
        targets = _.filter(targets, creep =>
            creep.owner &&
            !isAlly(creep.owner.username)
        );

        if (targets.length <= 0) {
            if (defense.active == 1) {
                if (!defense.cooldown) {
                     defense.cooldown = Game.time + C.DEFENSE_COOLDOWN;
                }

                if (defense.cooldown < Game.time) {
                    defense.active = 0;
                    defense.jobId = undefined;
                    defense.cooldown = undefined;
                    logger.alert('defense mode standing down in room: ' + room.toString());
                    delQueueRecord(defense.jobId);
                }
            }
            return;
        }

        if (defense.cooldown) defense.cooldown = undefined;
        if (defense.active != 1) {
            defense.tick = Game.time;
            defense.active = 1;
            defense.creepLimit = 1;
            logger.alert('defense mode activated in room: ' + room.toString());
        }

        let creepLimit = Math.ceil((Game.time - defense.tick) / C.DEFENSE_LIMIT_INCREASE_DELAY);
        if (defense.creepLimit < creepLimit) defense.creepLimit = creepLimit;

        if (!defense.jobId || !getQueueRecord(defense.jobId)) {
            defense.jobId = addQueueRecordWork({
                workRoom: room.name,
                spawnRoom: this.memory.spawnRoom,
                task: C.WORK_DEFENSE,
                priority: 10,
            });
        }

        let task = getQueueRecord(defense.jobId);
        if (defense.creepLimit != task.creepLimit) task.creepLimit = defense.creepLimit;
    },

    doDefenseSafeMode: function(room) {
        let spawns = room.getSpawns();
        if (spawns.length <= 0) return;

        let alert;

        for (let i = 0; i < spawns.length; i++) {
            if (spawns[i].hits < (spawns[i].hitsMax / 2)) {
                alert = true;
                break;
            }
        }

        if (alert && !room.controller.safeMode &&
            !room.controller.safeModeCooldown &&
            room.controller.safeModeAvailable > 1
        ) {
            room.controller.activateSafeMode();
            logger.alert('safe mode activated in room: ' + room.toString());
        }
    },

};

module.exports = libDefense;
