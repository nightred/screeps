/*
 * job Mil Brawl Group
 */

var taskMilBrawlGroup = function() {
    // init
};

_.merge(taskMilBrawlGroup.prototype, require('lib.spawn.group'));

taskMilBrawlGroup.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        logger.debug('removing process, missing needed values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom
        );
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (!this.memory._init) {
        this.memory.spawn = {[C.ROLE_COMBAT_BRAWLER]: 1, [C.ROLE_COMBAT_MEDIC]: 1};
        this.memory._moveList = [];
        this.memory._init = 1;
    }

    this.doCreepSpawn();
    this.doCreepCleanup();

    if (this.memory._spawnComplete && _.isEmpty(this.memory.creeps)) {
        logger.alert('completed job, all creeps have been removed or killed, removing process');
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (this.memory.creeps[C.ROLE_COMBAT_BRAWLER]) this.doBrawler();
    if (this.memory.creeps[C.ROLE_COMBAT_MEDIC]) this.doMedic();
};

taskMilBrawlGroup.prototype.doBrawler = function() {
    let creep = Game.creeps[this.memory.creeps[C.ROLE_COMBAT_BRAWLER][0]];
    if (!creep) return;
    if (creep.spawning) return;

    if (!this.memory._moveList[0])
        this.memory._moveList.push(creep.pos);

    let lastPos = getPos(this.memory._moveList[0]);
    if (!creep.pos.inRangeTo(lastPos,0))
        this.memory._moveList.unshift(creep.pos);

    if (this.memory._moveList.length > 4) this.memory._moveList.pop();
};

taskMilBrawlGroup.prototype.doBrawler = function() {
    let creep = Game.creeps[this.memory.creeps[C.ROLE_COMBAT_MEDIC][0]];
    if (!creep) return;
    if (creep.spawning) return;
    if (!this.memory._moveList[0]) return;


};

var getPos = function(pos) {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
};

registerProcess(C.JOB_MIL_BRAWLGROUP, taskMilBrawlGroup);
