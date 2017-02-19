/*
 * work Refill Tower
 *
 * Refill Tower work handles providing the tower with energy
 *
 */

var workRefillTower = {

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
        creep.transferEnergy(target);
    },
    
    checkWork: function(target) {
        if (target.energy >= Math.floor(target.energyCapacity * Constant.REFILL_TOWER_MAX)) {
            return true;
        }
        
        return false;
    },
};

module.exports = workRefillTower;
