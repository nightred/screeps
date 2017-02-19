/*
 * work Build
 *
 * build work handles construction
 *
 */

var workBuild = {

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
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    
    checkWork: function(target) {
        if (!target) {
            return true;
        }
        
        return false;
    },
    
    findWork: function(room) {
        if (!room) { return false; }
        
        return room.getConstructionSites();
    },
    
};

module.exports = workBuild;
