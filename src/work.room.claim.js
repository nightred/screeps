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
        creep.memory.travelTime = creep.memory.travelTime || 0;
        
        if (creep.room.name != work.room) {
            if (creep.moveToRoom(work.room) == OK) {
                creep.memory.travelTime++;
            }
            
            return true;
        }
        
        if (!Game.rooms[work.room] ||
            !Game.rooms[work.room].controller) { return creep.removeWork(); }
        let target = Game.rooms[work.room].controller;
        
        if (this.checkWork(target)) { return true;}
        this.doWork(creep, target);
        
        return true;
    },
    
    doManage: function(work) {
        if (!work) { return false; }

        let count = work.creeps.length;
        count += QSpawn.getQueueInRoomByRole(room.name, 'controller').length;
        
        if (count == 0) {
            QSpawn.addQueue(work.spawnRoom, 'controller', 10);
        }

        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        if (creep.claimController(target) == ERR_NOT_IN_RANGE) {
            if (creep.moveTo(target, { range: 1, }) == OK) {
                creep.memory.travelTime++;
            }
        }
        
        return true;
    },
    
    checkWork: function(target) {
        if (!target) { return false; }
        if (!target.reservation) { return; false; }
        if (target.reservation.ticksToEnd < 4000) { return; false; }
        
        return true;
    },
    
};

module.exports = workRoomClaim;
