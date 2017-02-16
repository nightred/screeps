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
    
    if ((this.store[RESOURCE_ENERGY] - this.memory.reservedEnergy) >= Constant.ENERGY_CONTAINER_MIN_WITHDRAW) {
        this.addReserve(energy);
        
        return true;
    }
    
    return false;
}

StructureContainer.prototype.withdrawnEnergy = function(energy) {
    if (!this.memory.reservedEnergy || this.memory.reservedEnergy == undefined) {
        this.memory.reservedEnergy = 0;
    }
    this.removeReserve(energy);
    
    return true;
}

StructureContainer.prototype.addReserve = function(energy) {
    this.memory.reservedEnergy += energy;
    this.memory.reservedTime = Game.time;
    
    if (this.memory.reservedEnergy > this.store[RESOURCE_ENERGY]) {
        this.memory.reservedEnergy = this.store[RESOURCE_ENERGY];
    }

    return true;
}

StructureContainer.prototype.removeReserve = function(energy) {
    this.memory.reservedEnergy -= energy;
    
    if (this.memory.reservedEnergy > this.store[RESOURCE_ENERGY]) {
        this.memory.reservedEnergy = this.store[RESOURCE_ENERGY];
    }
    
    if (this.memory.reservedEnergy < 0) {
        this.memory.reservedEnergy = 0;
        this.memory.reservedTime = false;
    }
    
    return true;
}
