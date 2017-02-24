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
        
        if (creep.room.name != work.room) {
            creep.moveToRoom(work.room);
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
        
        if (!Game.rooms[work.room]) { return creep.removeWork(); }
        
        if (work.creeps.length < 1 &&
            QSpawn.getQueueInRoomByRole(work.spawnRoom, 'claimer').length < 1) {
            QSpawn.addQueue(work.spawnRoom, 'claimer', 10);
        } else if (work.creeps[0] &&
            QSpawn.getQueueInRoomByRole(work.spawnRoom, 'claimer').length < 1) {
                let creep = Game.creeps[work.creeps[0]];
                
                if (creep.ticksToLive < 8) {
                    //
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
        if (!target.reservation) { return; false; }
        if (target.reservation.ticksToEnd < 4000) { return; false; }
        
        return true;
    },
    
};

module.exports = workRoomClaim;
