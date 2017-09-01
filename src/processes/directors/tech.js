/*
 * Director Tech
 *
 * manages the spawning of techs
 *
 */

var directorTech = function() {
    // init
}

directorTech.prototype.run = function() {
    if (isSleep(this)) return true;

    let workRoom = Game.rooms[this.memory.workRoom];

    let findWorkTasks = [
        C.WORK_TOWER_REFILL,
        C.WORK_REPAIR,
        C.WORK_CONSTRUCTION,
    ];

    for (let i = 0; i < findWorkTasks.length; i++) {
        doWorkFind(findWorkTasks[i], workRoom);
    }

    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom.isInCoverage(this.memory.workRoom)) {
        spawnRoom.addCoverage(this.memory.workRoom);
    }

    if (this.memory.spawnRoom == this.memory.workRoom) {
        this.doSpawn(task);

        let sCount = 0;

        for (let i = 0; i < this.memory.creep.length; i++) {
            if (Game.creeps[this.memory.creep[i]].isSleep()) {
                sCount++;
            }
        }
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

directorTech.prototype.doSpawn = function(task) {
    let spawnRoom = Game.rooms[this.memory.spawnRoom];

    if (!spawnRoom || !spawnRoom.controller || !spawnRoom.controller.my) {
        return false;
    }

    // set size limits
    let minSize = 200;
    let maxSize = 9999;

    switch (spawnRoom.controller.level) {
    case 1:
    case 2:
        maxSize = 300;
        break;

    case 3:
        maxSize = 400;
        break;

    case 4:
        minSize = 300;
        maxSize = 400;
        break;

    case 5:
    case 6:
        minSize = 400;
        maxSize = 500;
        break;

    case 7:
    case 8:
        minSize = 400;
        maxSize = 9999;
        break;

    };

    if (spawnRoom.storage && spawnRoom.controller.level < 4) {
        minSize = 200;
    }

    // set spawn limits
    let creepLimit = 1;

    if (!this.memory.creepLimit) {
        let roomCount = spawnRoom.countCoverage();

        if (!isNaN(roomCount)) {
            creepLimit = roomCount;

            if (spawnRoom && spawnRoom.controller && spawnRoom.controller.my &&
                spawnRoom.controller.level >= 4) {
                creepLimit++;
            }
        }
    } else {
        creepLimit = this.memory.creepLimit;
    }

    if (!this.memory.creep) {
        this.memory.creep = [];
    }

    // remove old creep and clear spawn job when done
    let removeCreep = [];

    for (let i = 0; i < this.memory.creep.length; i++) {
        if (!Game.creeps[this.memory.creep[i]]) {
            removeCreep.push(this.memory.creep[i]);
        }
    }

    if (removeCreep.length > 0) {
        for (let i = 0; i < removeCreep.length; i++) {
            directorRemoveCreep(this.pid, removeCreep[i]);
        }
    }

    if (this.memory.spawnId && !getQueueRecord(this.memory.spawnId)) {
        this.memory.spawnId = undefined;
    }

    // spawn new creep if below limit
    if (this.memory.creep.length < creepLimit && !this.memory.spawnId) {

        let coverage = spawnRoom.getCoverage();

        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: C.ROLE_TECH,
            priority: 54,
            directorId: this.memory.id,
            minSize: minSize,
            maxSize: maxSize,
            creepArgs: {
                workRooms: coverage,
                task: C.TASK_TECH,
            },
        };

        if (this.memory.rcl8) { record.creepArgs.style = 'rcl8'; }

        this.memory.spawnId = addQueueSpawn(record);
    }

    return true;
};

registerProcess(C.DIRECTOR_TECH, directorTech);
