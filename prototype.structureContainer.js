/*
 * Container common functions
 *
 * Provides common functions to all containers
 *
 */
 
StructureContainer.prototype.reserveEnergy = function(energy) {
    if (!this.memory.reservedEnergy || this.memory.reservedEnergy == undefined) {
        this.memory.reservedEnergy = 0;
    }
    
    if (this.memory.reservedTime < (Game.time - 20) && this.memory.reservedTime) {
        this.memory.reservedTime = false;
        this.memory.reservedEnergy = 0;
    }
    
    if ((this.store[RESOURCE_ENERGY] - (this.memory.reservedEnergy + energy)) >= Constant.ENERGY_CONTAINER_MIN_WITHDRAW) {
        this.memory.reservedEnergy += energy;
        this.memory.reservedTime = Game.time;
        this.balanceReserve();
        
        return true;
    }
    
    return false;
}

StructureContainer.prototype.withdrawnEnergy = function(energy) {
    
    if (!this.memory.reservedEnergy || this.memory.reservedEnergy == undefined) {
        this.memory.reservedEnergy = 0;
    }
    
    this.memory.reservedEnergy -= energy;
    this.balanceReserve();
    
    return true;
}

StructureContainer.prototype.balanceReserve = function() {
    if (this.memory.reservedEnergy > this.store[RESOURCE_ENERGY]) {
        this.memory.reservedEnergy = this.store[RESOURCE_ENERGY];
    }
    
    if (this.memory.reservedEnergy < 0) {
        this.memory.reservedEnergy = 0;
        this.memory.reservedTime = false;
    }
    
    return true;
}
