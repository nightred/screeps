/*
 * work Claim Room
 *
 * room.claim work handles repairing structures with hit damage
 *
 */

var workRoomClaim = {

    run: function(creep, work) {
        if (!creep) { return false; }
        if (!work) { return false; }
        
        let target = Game.getObjectById(work.targetId);
        if (!target) { return creep.removeWork(); }
        
        if (this.checkWork(target)) { return creep.removeWork(); }
        this.doWork(creep, target);
        
        return true;
    },
    
    doManage: function(task) {
        if (!task) { return false; }
        
        let room = Game.rooms[task.room];
        if (!room) { 
            Work.removeWork(task.id);
            return false;
        }
        
        switch (room.controller.level) {
            case 3:
                if (task.minSize < 300) {
                    task.minSize = 300;
                }
            case 4:
                if (task.minSize < 400) {
                    task.minSize = 400;
                }
                break;
            case 5:
                if (task.minSize < 600) {
                    task.minSize = 600;
                }
        }
        
        let count = room.getSourceCount();
        if (count < 1) { return false; }
        
        count -= _.filter(Game.creeps, creep => 
            creep.memory.role == 'harvester' && 
            creep.room.name == room.name &&
            creep.memory.despawn != true
            ).length;
        count -= QSpawn.getQueueInRoomByRole(room.name, 'harvester').length;
        
        let args = {};
        if (task.minSize) { args.minSize = task.minSize; }
        
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                QSpawn.addQueue(room.name, 'harvester', 50, args);
            }
        }
        
        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        if (creep.reserveController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { range: 1, });
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
    
};

module.exports = workRoomClaim;
