/*
 * work Repair
 *
 * repair work handles repairing structures with hit damage
 *
 */

var workRepair = {

    run: function(creep, work) {
        if (!creep) { return false; }
        if (!work) { return false; }
        
        let target = Game.getObjectById(work.targetId);
        if (!target) { return false; }
        
        if (this.checkWork(target)) {
            creep.removeWork();

            return true;
        }
        this.doWork(creep, target);
        
        return true;
    },
    
    doWork: function(creep, target) {
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    
    checkWork: function(target) {
        if (target.hits >= Math.floor(target.hitsMax * Constant.REPAIR_HIT_WORK_MAX)) {
            return true;
        }
        
        return false;
    },
};

module.exports = workRepair;
