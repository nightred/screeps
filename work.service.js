/*
 * work Service
 *
 * service work handles the service creeps in a room
 *
 */

var workService = {
    
    doManage: function(task) {
        if (!task) { return false; }
        
        let room = Game.rooms[task.room];
        if (!room) { 
            Work.removeWork(task.id);
            return false;
        }
        if (!room.controller) { 
            Work.removeWork(task.id);
            return false;
        }
        
        let count = task.creepLimit;
        count = count < 1 ? 1 : count;
        
        count -= _.filter(Game.creeps, creep => 
            creep.memory.role == 'service' && 
            creep.room.name == room.name &&
            creep.memory.despawn != true
            ).length;
        count -= QSpawn.getQueueInRoomByRole(room.name, 'service').length;
        
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                QSpawn.addQueue(room.name, 'service', 60);
            }
        }
        
        return true;
    },

};

module.exports = workService;
