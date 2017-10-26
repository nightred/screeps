/*
 * Scout
 *
 * boldly go where no creep has gone before
 *
 */

var logger = new Logger('[Scout]');

var jobScout = function() {
    // init
};

jobScout.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        logger.debug('removing process, missing needed values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom
        );
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (!this.memory._spawned) {
        this.spawnCreep();
    } else {
        let creep = Game.creeps[this.memory.creepName];
        if (!creep) {
            logger.alert('scout job has been completed, removing process');
            Game.kernel.killProcess(this.pid);
            return;
        }
        this.doScouting(creep);
    }
};

jobScout.prototype.doScouting = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;
    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    let targets = creep.room.getHostileConstructionSites();
    if (targets.length > 0) {
        creep.moveTo(targets[0].pos.x, targets[0].pos.y, { reusePath: 30, });
        return;
    }

    this.memory.position = this.memory.position || 0;

    let x = 10;
    let y = 10;
    switch (this.memory.position) {
    case 1:
        y = 40;
        break;

    case 2:
        x = 40;
        y = 40;
        break;

    case 3:
        x = 40;
        break;
    }

    let location = new RoomPosition(x, y, this.memory.workRoom);
    if (creep.moveTo(location, {
        range: 6,
        reusePath: 30,
        visualizePathStyle: {
            fill: 'transparent',
            stroke: '#fff',
            lineStyle: 'dashed',
            strokeWidth: .15,
            opacity: .1,
        },
    }) == ERR_NO_PATH) {
        this.memory.position++;
        this.memory.position = this.memory.position < 4 ? this.memory.position : 0;
    }
};

jobScout.prototype.spawnCreep = function() {
    let spawnRecord = getQueueRecord(this.memory.spawnId);
    if (!spawnRecord && this.memory.spawnId) this.memory.spawnId = undefined;

    if (spawnRecord && spawnRecord.spawned) {
        this.memory.creepName = spawnRecord.name;
        this.memory._spawned = 1;
        logger.debug('adding creep ' + spawnRecord.name +
            ', to scout task for room: ' + this.memory.workRoom
        );
        logger.debug('removing spawn queue id: ' + spawnRecord.id +
            ', role: ' + spawnRecord.role
        );
        delQueueRecord(spawnRecord.id);
    }

    if (!spawnRecord && !this.memory.spawnId) {
        this.memory.spawnId = addQueueRecordSpawn({
            room: this.memory.spawnRoom,
            role: C.ROLE_SCOUT,
            priority: 38,
            creepArgs: {},
        });
    }
};

registerProcess(C.JOB_SCOUT, jobScout);
