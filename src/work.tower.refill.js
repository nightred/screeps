/*
 * work Tower Refill 
 *
 * tower refill work handles filling towers with energy
 *
 */

var workTowerRefill = {

    run: function(creep, work) {
        if (!creep) { return false; }
        if (!work) { return false; }
        
        let target = Game.getObjectById(work.targetId);
        if (!target) { return creep.removeWork(); }
        
        if (this.checkWork(target)) { return creep.removeWork(); }
        this.doWork(creep, target);
        
        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        creep.transferEnergy(target);
        
        return true;
    },
    
    checkWork: function(target) {
        if (!target) { return false; }
        
        if (target.energy >= Math.floor(target.energyCapacity * Constant.REFILL_TOWER_MAX)) {
            return true;
        }
        
        return false;
    },
    
    findWork: function(room) {
        if (!room) { return false; }
        
        return _.filter(room.getTowers(), structure =>
                structure.energy < (structure.energyCapacity * Constant.REFILL_TOWER_MIN)
                );
    },
    
};

module.exports = workTowerRefill;
