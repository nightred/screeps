/*
 * Director Source
 *
 * runs processes to manage mining of a source
 *
 */

var directorSource = function() {
    // init
}

directorSource.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.workRoom];

    if (!room) {
        return false;
    }

    if (!this.memory.creep) {
        this.memory.creep = [];
    }

    // set spawn limits
    let creepLimit = 1;

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
        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: C.ROLE_MINER,
            priority: 50,
            directorId: this.memory.id,
            creepArgs: {
                sourceId: this.memory.sourceId,
                workRoom: this.memory.workRoom,
                task: C.TASK_SOURCE,
            },
        };

        let source = Game.getObjectById(this.memory.sourceId);

        if (source && source.getDropContainer()) {
            record.creepArgs.style = 'drop';
        } else if (this.memory.spawnRoom != this.memory.roomName) {
            record.creepArgs.style = 'ranged';
        }

        this.memory.spawnId = addQueueSpawn(record);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

registerProcess(C.DIRECTOR_SOURCE, directorSource);
