/*
 * Library for defense of rooms
 */

var logger = new Logger('[Defense]');

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
            this.doMilitiaTask();
        }

        this.doDefenseModeRoom(room);
    },

    doMilitiaTask: function() {
        if (!Game.kernel.getProcessByPid(this.memory.militiaPid)) {
            process = Game.kernel.startProcess(this, C.TASK_MILITIA, {
                spawnRoom: this.memory.spawnRoom,
            });
            this.memory.militiaPid = process.pid;
        }
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
