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
        if (!target) { return creep.removeWork(); }
        
        if (this.checkWork(target)) { return creep.removeWork(); }
        this.doWork(creep, target);
        
        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { range: 3, });
        }
        
        return true;
    },
    
    checkWork: function(target) {
        if (!target) { return false; }
        
        if (target.hits >= Math.floor(target.hitsMax * Constant.REPAIR_HIT_WORK_MAX)) {
            return true;
        }
        
        return false;
    },
    
    findWork: function(room) {
        if (!room) { return false; }
        
        let targets = _.sortBy(_.filter(room.find(FIND_MY_STRUCTURES), structure =>
                structure.hits < (structure.hitsMax * Constant.REPAIR_HIT_WORK_MIN) &&
                structure.structureType != STRUCTURE_RAMPART
                ), structure => structure.hits / structure.hitsMax);
            
        _.filter(room.find(FIND_STRUCTURES), structure => 
            (structure.structureType == STRUCTURE_CONTAINER || 
            structure.structureType == STRUCTURE_ROAD) &&
            (structure.structureType != STRUCTURE_WALL &&
            structure.structureType != STRUCTURE_RAMPART) &&
            structure.hits < (structure.hitsMax * Constant.REPAIR_HIT_WORK_MIN)
            ).forEach(structure => targets.push(structure));
        
        return targets;
    },
    
};

module.exports = workRepair;
