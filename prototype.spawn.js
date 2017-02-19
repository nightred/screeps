/*
 * Spawn common functions
 *
 * Provides common functions to all spawns
 * Default creep spawn routines based on role
 *
 */

StructureSpawn.prototype.createHarvester = function(energy) {
    let dropHarvest = false;
    let source = Game.getObjectById(this.room.getHarvestTarget());
    if (source) {
        if (source.getDropContainer()) { dropHarvest = true; }
    }
    
    let bodyParts = [];
    let extrasCost = 50;
    bodyParts.push(MOVE);
    if (!dropHarvest) {
        bodyParts.push(CARRY);
        extrasCost += 50;
    }
    
    let workUnits = Math.floor((energy - extrasCost) / 100);
    workUnits = workUnits > 5 ? 5 : workUnits;
    for (let i = 0; i < workUnits; i++) {
        bodyParts.push(WORK);
    }
    
    return this.createCreep(bodyParts, undefined, {role: 'harvester', harvestTarget: source.id, dropHarvest: dropHarvest});
}

StructureSpawn.prototype.createService = function(energy) {
    let bodyUnits = Math.floor(energy / 200);
    let bodyParts = [];
    
    bodyUnits = bodyUnits > 5 ? 5 : bodyUnits;
    for (let i = 0; i < bodyUnits; i++) {
        bodyParts.push(WORK);
        bodyParts.push(MOVE);
        bodyParts.push(CARRY);
    }
    
    return this.createCreep(bodyParts, undefined, {role: 'service'});
}

StructureSpawn.prototype.createUpgrader = function(energy) {
    let workUnits = Math.floor((energy - 100) / 100);
    let bodyParts = [];
    
    workUnits = workUnits > 5 ? 5 : workUnits;
    for (let i = 0; i < workUnits; i++) {
        bodyParts.push(WORK);
    }
    
    bodyParts.push(MOVE);
    bodyParts.push(CARRY);
    
    return this.createCreep(bodyParts, undefined, {role: 'upgrader'});
}

StructureSpawn.prototype.createHauler = function(energy) {
    let CarryUnits = Math.floor((energy / 2) / 50);
    let MoveUnits = Math.floor((energy / 2) / 50);
    let bodyParts = [];
    
    MoveUnits = MoveUnits > 4 ? 4 : MoveUnits;
    for (let i = 0; i < MoveUnits; i++) {
        bodyParts.push(MOVE);
    }
    
    CarryUnits = CarryUnits > 8 ? 8 : CarryUnits;
    for (let i = 0; i < CarryUnits; i++) {
        bodyParts.push(CARRY);
    }
    
    
    return this.createCreep(bodyParts, undefined, {role: 'hauler'});
}
