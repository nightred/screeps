/*
 * Director Stocking
 *
 * manages the stocking of resources in links and other buildings
 *
 */

var directorStocking = function() {
    // init
}

directorStocking.prototype.run = function() {
    if (isSleep(this)) return true;

    let room = Game.rooms[this.memory.workRoom];

    if (!room || !room.storage || !room.controller || !room.controller.my) {
        return false;
    }

    // set spawn limits
    let creepLimit = 0;

    if (_.filter(room.getLinks(), structure =>
        structure.memory.type == 'storage').length > 0) {
        creepLimit = 1;
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

    if (this.memory.spawnId && !Game.Queue.getRecord(this.memory.spawnId)) {
        this.memory.spawnId = undefined;
    }

    // spawn new creep if below limit
    if (this.memory.creep.length < creepLimit && !this.memory.spawnId) {
        let record = {
            rooms: [ this.memory.spawnRoom, ],
            role: C.ROLE_STOCKER,
            priority: 49,
            directorId: this.memory.id,
            creepArgs: {
                workRoom: this.memory.workRoom,
                task: C.TASK_STOCK,
            },
        };

        this.memory.spawnId = Game.Queue.spawn.addRecord(record);
    }

    setSleep(this, (Game.time + C.DIRECTOR_SLEEP + Math.floor(Math.random() * 8)));

    return true;
};

registerProcess(C.DIRECTOR_STOCKING, directorStocking);
