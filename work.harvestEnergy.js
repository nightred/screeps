/*
 * work Harvest Energy
 *
 * harvest energy work handles the harvesting of source nodes
 * in a local room
 *
 */

var workHarvestEnergy = {
    
    doManage: function(task) {
        if (!task) { return false; }
        
        let room = Game.rooms[task.room];
        if (!room) { 
            Work.removeWork(task.id);
            return false;
        }
        
        let count = room.getSourceCount();
        if (count < 1) { return false; }
        
        count -= _.filter(Game.creeps, creep => 
            creep.memory.role == 'harvester' && 
            creep.room.name == room.name &&
            creep.memory.despawn != true
            ).length;
        count -= QSpawn.getQueueInRoomByRole(room.name, 'harvester').length;
        
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                QSpawn.addQueue(room.name, 'harvester', 50);
            }
        }
        
        return true;
    },

};

module.exports = workHarvestEnergy;
