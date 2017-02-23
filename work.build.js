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
        if (!target) { return creep.removeWork(); }
        
        this.doWork(creep, target);
        
        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { range: 3, });
        }
        
        return true;
    },
    
    findWork: function(room) {
        if (!room) { return false; }
        
        return room.getConstructionSites();
    },
    
};

module.exports = workBuild;
