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
            creep.moveToRoom(work.room);
            creep.memory.travelTime++;
            
            return true;
        }
        
        if (!creep.room.controller) { return creep.removeWork(); }
        let target = creep.room.controller;
        
        this.doWork(creep, target);
        
        return true;
    },
    
    doManage: function(work) {
        if (!work) { return false; }

        if (work.creeps.length == 0 && QSpawn.getQueueInRoomByRole(work.spawnRoom, 'controller').length == 0) {
            QSpawn.addQueue(work.spawnRoom, 'controller', 10);
        }
        if (work.creeps.length == 1 && QSpawn.getQueueInRoomByRole(work.spawnRoom, 'controller').length == 0) {
            let controller = Game.rooms[work.room].controller;
            let creep = Game.creeps[work.creeps[0]];
            let life = creep.ticksToLive - creep.memory.travelTime;
            if (life <= 0 && creep.room.name == work.room && controller) {
                if (controller.reservation) {
                    if (controller.reservation.ticksToEnd < 4000) {
                        QSpawn.addQueue(work.spawnRoom, 'controller', 10);
                    }
                }
            }
        }

        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        if (creep.reserveController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { range: 1, });
            creep.memory.travelTime++;
        }
        
        return true;
    },
    
};

module.exports = workRoomClaim;
