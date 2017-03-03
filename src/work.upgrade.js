/*
 * work Upgrade
 *
 * upgrade work handles upgrading the controller of a room
 *
 */

var workUpgrade = {
    
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
        
        let count = task.creepLimit;
        count = count < 1 ? 1 : count;
        
        count -= _.filter(Game.creeps, creep => 
            creep.memory.role == 'upgrader' && 
            creep.room.name == room.name &&
            creep.memory.despawn != true
            ).length;
        count -= QSpawn.getQueueInRoomByRole(room.name, 'upgrader').length;
        
        let args = {};
        if (task.minSize) { args.minSize = task.minSize; }
        
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                QSpawn.addQueue(room.name, 'upgrader', 80, args);
            }
        }
        
        return true;
    },

};

module.exports = workUpgrade;