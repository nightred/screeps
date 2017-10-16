/*
 * task Claim
 *
 * task claim travels to a room and claims the controller
 *
 */

var logger = new Logger('[Job Claim]');

var jobClaim = function() {
 // init
};

_.merge(jobClaim.prototype, require('lib.spawn.group'));

jobClaim.prototype.run = function() {
    if (!this.memory.spawnRoom || !this.memory.workRoom) {
        logger.debug('removing process, missing needed values\n' +
            'spawnRoom: ' + this.memory.spawnRoom +
            ', workRoom: ' + this.memory.workRoom
        );
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (this.memory._completed) {
        logger.alert('claim job has been completed, removing process');
        Game.kernel.killProcess(this.pid);
        return;
    }

    if (!this.memory._init) {
        if (!this.memory.spawn) this.memory.spawn = {[C.ROLE_CLAIMER]: 1};
        this.memory._init = 1;
    }

    this.doCreepSpawn();
    this.doCreepCleanup();

    if (this.memory._spawnComplete && _.isEmpty(this.memory.creeps)) {
        logger.alert('completed job, all creeps have been removed, removing process');
        Game.kernel.killProcess(this.pid);
        return;
    }

    for (const role in this.memory.creeps) {
        for (var i = 0; i < this.memory.creeps[role].length; i++) {
            let creep = Game.creeps[this.memory.creeps[role][i]];
            if (!creep) continue;
            this.doCreepActions(creep);
        }
    }
};

/**
* @param {Creep} creep The creep object
**/
jobClaim.prototype.doCreepActions = function(creep) {
    if (creep.spawning) return;
    if (creep.getOffExit()) return;

    if (creep.room.name != this.memory.workRoom) {
        creep.moveToRoom(this.memory.workRoom);
        return;
    }

    if (!creep.room.controller || creep.room.controller.my) {
        this.memory._completed = true;
        return;
    }

    if (!creep.pos.inRangeTo(creep.room.controller, 1)) {
        creep.goto(creep.room.controller, {
            range: 1,
            maxRooms: 1,
        });
        return;
    }

    creep.claimController(creep.room.controller);
};

registerProcess(C.JOB_CLAIM, jobClaim);
