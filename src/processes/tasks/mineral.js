/*
 * task Mineral
 *
 * harvest mineral from the extractor
 *
 */

var taskMineral = function() {
    // init
};

taskMineral.prototype.run = function() {
    let creep = Game.creeps[this.memory.creepName];

    if (!creep) {
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (creep.getOffExit()) {
        return;
    }

    if (creep.isSleep()) {
        creep.moveToIdlePosition();
        return;
    }

    if (creep.room.name != task.workRoom) {
        creep.moveToRoom(task.workRoom);
        return true;
    }

    let extractor = Game.getObjectById(creep.extractorId);
    if (!extractor) {
        if (C.DEBUG >= 3) { console.log('VERBOSE - extractor missing in room: ' + creep.room.name + ', creep: ' + creep.name); }
        creep.doDespawn();
        return false;
    }
    if (extractor.cooldown > 0) {
        return true;
    }

    let mineral = Game.getObjectById(creep.mineralId);
    if (!mineral) {
        if (C.DEBUG >= 3) { console.log('VERBOSE - mineral missing in room: ' + creep.room.name + ', creep: ' + creep.name); }
        creep.doDespawn();
        return false;
    }

    if (!creep.pos.inRangeTo(mineral, 1)) {
        let args = {
            range: 1,
            reusePath: 30,
            maxRooms: 1,
            ignoreCreeps: true,
        };
        creep.goto(mineral, args);
        return true;
    }

    creep.harvest(mineral)
    return true;
};

registerProcess('tasks/mineral', taskMineral);
