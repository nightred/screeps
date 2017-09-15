/*
 * task Scout
 *
 * boldly go where no creep has gone before
 *
 */

var logger = new Logger('[Scout]');
logger.level = C.LOGLEVEL.INFO;

var taskScout = function() {
    // init
};

taskScout.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];
    if (!creep) {
        this.spawnCreep();
        return;
    }

    this.doScouting(creep);
};

taskScout.prototype.doScouting = function(creep) {
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

taskScout.prototype.spawnCreep = function() {
    let spawnRecord = getQueueRecord(this.memory.spawnId);
    if (!spawnRecord && this.memory.spawnId) this.memory.spawnId = undefined;

    if (spawnRecord && spawnRecord.spawned) {
        this.memory.creepName = spawnRecord.name;
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
            rooms: [ this.memory.spawnRoom, ],
            role: C.ROLE_SCOUT,
            minSize: 200,
            maxSize: 200,
            priority: 38,
            creepArgs: {
                workRooms: this.memory.workRooms,
            },
        });
    }
};

registerProcess('tasks/scout', taskScout);
