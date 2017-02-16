/*
 * Room common functions
 *
 * Provides common functions to all rooms
 *
 */
 
Room.prototype.getSpawn = function() {
    if (!this.memory.spawnId || this.memory.spawnId == undefined) {
        let targets = this.find(FIND_MY_SPAWNS);
        
        if (targets.length > 0) {
            this.memory.spawnId = targets[0].id;
        } else {
            this.memory.spawnId = false;
        }
    }
    
    return this.memory.spawnId;
}
