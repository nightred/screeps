/*
 * Creep common functions
 *
 * Provides common functions to all creeps
 *
 */
 
Creep.prototype.manageState = function() {
    if (!this.carryCapacity > 0) {
        this.memory.working = true;
        
        return true;
    }
    
    if (this.memory.working && this.isEnergyEmpty()) {
        this.memory.working = false;
        
        return true;
    }
    if (!this.memory.working && this.isEnergyFull()) {
        this.memory.working = true;
        
        return true;
    }
    
    return false;
}

Creep.prototype.toggleState = function() {
    if (this.memory.working) {
        this.memory.working = false;
    } else {
        this.memory.working = true;
    }
    
    return true;
}

Creep.prototype.isEnergyEmpty = function() {
    return this.carry.energy == 0;
}

Creep.prototype.isEnergyFull = function() {
    return this.carry.energy == this.carryCapacity;
}

Creep.prototype.isCarryingEnergy = function() {
    return this.carry.energy > 0;
}

Creep.prototype.isDespawnWarning = function() {
    return this.ticksToLive < Constant.CREEP_DESPAWN_TICKS;
}

Creep.prototype.setDespawn = function() {
    this.memory.despawn = true;
    this.memory.goingTo = false;
    this.memory.harvestTarget = false;
    
    this.leaveWork();
    
    if (Constant.DEBUG >= 3) { console.log('DEBUG - ' + this.memory.role + ' ' + this.name + ' end of life'); }
}

Creep.prototype.leaveWork = function() {
    if (!this.memory.workId) { return false; }
    Work.leaveWork(this.name, this.memory.workId);
    this.memory.workId = false;
    
    return true;
}

Creep.prototype.getWork = function(tasks) {
    if (!Array.isArray(tasks)) { return false; }

    let workId = Work.getWork(tasks, this.room.name);
    if (!workId) { return false; }
    if (!Work.setWork(this.name, workId)) { return false; }
    
    this.memory.workId = workId;
    
    return true;
}

Creep.prototype.doWork = function() {
    if (!this.memory.workId) { return false; }

    if (!Work.doWork(this)) {
        this.removeWork();
    }
    
    return true;
}

Creep.prototype.checkWork = function() {
    return Work.checkWork(this.memory.workId);
}

Creep.prototype.removeWork = function() {
    Work.removeWork(this.memory.workId);
    this.memory.workId = false;
}

Creep.prototype.transferEnergy = function(target) {
    if (!target) {
        this.memory.goingTo = false;
        
        return false;
    }
    
    if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(target);
    } else {
        this.memory.goingTo = false;
        this.memory.blockContainer = false;
    }
        
    return true;
}

Creep.prototype.withdrawEnergy = function(target) {
    if (!target) {
        this.memory.goingTo = false;
        
        return false;
    }
    
    if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(target);
    } else {
        this.memory.goingTo = false;

        if (target.structureType == STRUCTURE_CONTAINER) {
            target.withdrawnEnergy(this.carryCapacity - _.sum(this.carry));
        }
    }
        
    return true;
}

Creep.prototype.setGoingTo = function(target, leaveRoom) {
    leaveRoom = typeof leaveRoom !== 'undefined' ? leaveRoom : false;
    
    if (!target) {
        this.memory.goingTo = false;
        return false;
    }
    
    if (!leaveRoom && (target.pos.x < 1 || target.pos.y < 1 || target.pos.x > 48 || target.pos.y > 48)) {
        this.memory.goingTo = false;
       return false;
    }
    
    this.memory.goingTo = target.id;
    
    return true;
}

Creep.prototype.isGoingTo = function() {
    return this.memory.goingTo ? true : false;
}

Creep.prototype.getTargetTowerEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';
    
    let targets = this.room.getTowers();
    if (!targets.length > 0) { return false; }
    
    if (useMode == 'store') {
        targets = _.filter(targets, structure => 
            structure.energy < Constant.ENERGY_TOWER_MIN
        );
    } else if (useMode == 'withdraw') {
        targets = _.filter(targets, structure => 
            structure.energy > 0
        );
    }
    
    return targets;
}

Creep.prototype.getTargetStorageEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';
    
    let target = this.room.storage;
    if (!target) { return false; }
    
    if (useMode == 'store' && 
        _.sum(target.store) == target.storeCapacity) {
        return false;
    }
    if (useMode == 'withdraw' && 
        target.store[RESOURCE_ENERGY] < Constant.ENERGY_STORAGE_MIN_WITHDRAW) {
        return false;
    }
    
    return target;
}

Creep.prototype.getTargetSpawnEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';
    
    if (useMode == 'withdraw' && 
        this.room.energyAvailable < Constant.ENERGY_ROOM_WITHDRAW_MIN ) {
        return false;
    }
    
	let target = Game.getObjectById(this.room.getSpawn());
	if (!target) { return false; }

    if (useMode == 'store' && 
        target.energy == target.energyCapacity) {
        return false;
    }
    if (useMode == 'withdraw' && 
        target.energy == 0) {
        return false;
    }
    
    return target;
}

Creep.prototype.getTargetExtentionEnergy = function(useMode) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';
    
    if (useMode == 'withdraw' && 
        this.room.energyAvailable < Constant.ENERGY_ROOM_WITHDRAW_MIN) {
        return false;
    }
    
    let targets = this.room.getExtensions();
    if (!targets.length > 0) { return false; }
    
    if (useMode == 'store') {
        targets = _.filter(targets, structure => 
            structure.energy < structure.energyCapacity
        );
    } else if (useMode == 'withdraw') {
        targets = _.filter(targets, structure => 
            structure.energy > 0
        );
    }
    
    return targets;
}

Creep.prototype.getTargetContainerEnergy = function(useMode, storeType, fillLevel) {
    useMode = typeof useMode !== 'undefined' ? useMode : 'store';
    storeType = typeof storeType !== 'undefined' ? storeType : 'default';
    fillLevel = typeof fillLevel !== 'undefined' ? fillLevel : false;

    let targets = this.room.getContainers();
    if (!targets.length > 0) { return false; }
    
    if (storeType == 'in') {
        targets = _.filter(targets, structure => structure.memory.type == 'in');
    } else if (storeType == 'out') {
        targets = _.filter(targets, structure => structure.memory.type == 'out');
    } else if (storeType == 'default') {
        targets = _.filter(targets, structure => structure.memory.type == 'default');
    }
    
    if (useMode == 'store') {
        targets = _.filter(targets, structure => 
            _.sum(structure.store) < (structure.storeCapacity * Constant.ENERGY_CONTAINER_MAX_PERCENT)
        );
    } else if (useMode == 'withdraw') {
        targets = _.filter(targets, structure => 
            structure.store[RESOURCE_ENERGY] > (structure.storeCapacity * Constant.ENERGY_CONTAINER_MIN_PERCENT)
        );
    }
    
    if (fillLevel) {
        targets = _.sortBy(targets, structure => structure.store[RESOURCE_ENERGY]);
        if (useMode == 'withdraw') { targets.reverse(); }
    }
    
    return targets;
}

Creep.prototype.collectDroppedEnergy = function () {
    let targets = _.sortBy(this.room.find(FIND_DROPPED_RESOURCES, {
        filter: resource => resource.resourceType == RESOURCE_ENERGY
    }), resource => this.pos.getRangeTo(resource));
    
    if (targets.length > 0) {
        if (this.pickup(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.moveToIdlePosition = function() {
    if (this.isOnRoad() || this.isOnContainer()) {
        return this.move(Math.floor(Math.random() * 9)) == 0;
    }
    
    return true;
}

Creep.prototype.isOnRoad = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureRoad) != undefined;
}

Creep.prototype.isOnContainer = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureContainer) != undefined;
}
