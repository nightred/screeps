
Creep.prototype.manageState = function() {
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

Creep.prototype.storeEnergyToTower = function() {
    
    let targets = _.sortBy(this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER  && 
                structure.energy < (structure.energyCapacity - 300));
        }
    }), s => this.pos.getRangeTo(s));

    if (targets.length > 0) {

        if (this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.storeEnergyToSpawn = function() {
    
    let targetSpawn = this.room.find(FIND_MY_SPAWNS);

    if (targetSpawn.length > 0) {
        
        if (targetSpawn[0].energy == targetSpawn[0].energyCapacity) {
            return false;
        }

        if (this.transfer(targetSpawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targetSpawn[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.storeEnergyToExtention = function() {
    
    let targets = _.sortBy(this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION && 
                structure.energy < structure.energyCapacity);
        }
    }), s => this.pos.getRangeTo(s));

    if (targets.length > 0) {

        if (this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.storeEnergyToContainer = function(storeType, fillLevel) {
    
    storeType = typeof storeType !== 'undefined' ? storeType : 'default';
    fillLevel = typeof fillLevel !== 'undefined' ? fillLevel : false;
    
    var targets = _.sortBy(this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER && 
            _.sum(structure.store) < structure.storeCapacity);
        }
    }), s => this.pos.getRangeTo(s));
    
    targets = this.filterContainerTargets(targets, storeType);
    
    if (fillLevel) {
        targets = _.sortBy(targets, structure => structure.store[RESOURCE_ENERGY]);
    } else {
        targets = _.sortBy(targets, structure => this.pos.getRangeTo(structure));
    }
    
    if (targets.length > 0) {
        if (this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.withdrawEnergy = function() {
    
    if (this.withdrawEnergyFromContainer()) {
        return true;
    }
    if (this.withdrawEnergyFromExtention()) {
        return true;
    }
    if (this.withdrawEnergyFromSpawn()) {
        return true;
    }
    
    return false;
}

Creep.prototype.withdrawEnergyFromContainer = function(storeType, fillLevel) {
    
    storeType = typeof storeType !== 'undefined' ? storeType : 'default';
    fillLevel = typeof fillLevel !== 'undefined' ? fillLevel : false;
    
    var targets = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER && 
            structure.store[RESOURCE_ENERGY] > 0);
        }
    });
    
    targets = this.filterContainerTargets(targets, storeType);
    
    if (fillLevel) {
        targets = _.sortBy(targets, structure => structure.store[RESOURCE_ENERGY]).reverse();
    } else {
        targets = _.sortBy(targets, structure => this.pos.getRangeTo(structure));
    }
    
    //console.log('fill level: ' + fillLevel + ' targets: ' + targets);
    
    if (targets.length > 0) {
        if (this.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.withdrawEnergyFromExtention = function() {
    
    if (this.room.energyAvailable < Constant.ROOM_ENERGY_LIMIT) {
        return false;
    }
    
    let targets = _.sortBy(this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_EXTENSION ) && 
            structure.energy > 0);
        }
    }), s => this.pos.getRangeTo(s));
    
    if (targets.length > 0) {
        if (this.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.withdrawEnergyFromSpawn = function() {
    let targetSpawn = this.room.find(FIND_MY_SPAWNS);
    
    if (this.room.energyAvailable < Constant.ROOM_ENERGY_LIMIT) {
        return false;
    }
    
    if (targetSpawn != undefined) {
        if (targetSpawn[0].energy > 0) {
            if (this.withdraw(targetSpawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(targetSpawn[0]);
            }
            
            return true;
        }
    }
    
    return false;
}

Creep.prototype.getHarvestTarget = function() {
    
    let room = this.room;
    let sources = [];
    
    for (let source of room.find(FIND_SOURCES)) {
        let count = 0;
        for (let roomCreep of room.find(FIND_MY_CREEPS)) {
            if (roomCreep.memory.harvestTarget === source.id && roomCreep.memory.role == 'harvester') {
                count++;
            }
        }
        if (count < 1) {
            sources.push(source);
        }
    }
    
    if (sources.length > 0) {
        return sources[0].id;
    }
    
    return undefined;
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
    if (this.isOnRoad()) {
        return this.move(Math.floor(Math.random() * 9)) == 0;
    }
    
    return true;
}

Creep.prototype.isOnRoad = function() {
    return _.find(this.pos.lookFor(LOOK_STRUCTURES), i => i instanceof StructureRoad) != undefined;
}

Creep.prototype.buildConstructionSite = function() {
    let targets = _.sortBy(this.room.find(FIND_CONSTRUCTION_SITES), s => this.pos.getRangeTo(s));
    if (targets.length > 0) {
        if (this.build(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.repairStructures = function() {
    let targets = _.sortBy(this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType != STRUCTURE_WALL &&
                structure.structureType != STRUCTURE_RAMPART) ||
                (structure.structureType == STRUCTURE_RAMPART &&
                structure.hits < 2000)) &&
                structure.hits < structure.hitsMax
        }
    }), s => s.hits / s.hitsMax);
    this.room.find(FIND_STRUCTURES, {
        filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER && 
            structure.structureType == STRUCTURE_ROAD) &&
            structure.hits < structure.hitsMax
    }).forEach(structure => targets.push(structure));
    
    if (targets.length > 0) {
        if (this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        
        return true;
    }
    
    return false;
}

Creep.prototype.filterContainerTargets = function(targets, storeType) {

    if (!storeType == 'all') {
        return targets;
    }

    let filtered = [];    
    if (storeType == 'in') {
        for (let i = 0; i < targets.length; i++) {
            if (Constant.CONTAINERS_IN.indexOf(targets[i].id) > -1) {
                filtered.push(targets[i]);
            }
        }
    } else if (storeType == 'out') {
        for (let i = 0; i < targets.length; i++) {
            if (Constant.CONTAINERS_OUT.indexOf(targets[i].id) > -1) {
                filtered.push(targets[i]);
            }
        }
    } else {
        for (let i = 0; i < targets.length; i++) {
            if (!(Constant.CONTAINERS_IN.indexOf(targets[i].id) > -1 || Constant.CONTAINERS_OUT.indexOf(targets[i].id) > -1)) {
                filtered.push(targets[i]);
            }
            
        }
    }
    
    return filtered;
}
