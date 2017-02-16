/*
 * Spawn common functions
 *
 * Provides common functions to all spawns
 * Default creep spawn routines based on role
 *
 */
 
StructureSpawn.prototype.createBuilder = function(energy) {
    let bodyUnits = Math.floor(energy / 200);
    let bodyParts = [];
    
    bodyUnits = bodyUnits > 5 ? 5 : bodyUnits;
    for (let i = 0; i < bodyUnits; i++) {
        bodyParts.push(WORK);
        bodyParts.push(MOVE);
        bodyParts.push(CARRY);
    }
    
    return this.createCreep(bodyParts, undefined, {role: 'builder'});
}

StructureSpawn.prototype.createHarvester = function(energy) {
    let bodyParts = [];
    let extrasCost = 50;
    
    bodyParts.push(MOVE);
    if (Constant.HARVESTERS_CARRY) {
        bodyParts.push(CARRY);
        extrasCost += 50;
    }
    
    let workUnits = Math.floor((energy - extrasCost) / 100);
    workUnits = workUnits > 5 ? 5 : workUnits;
    for (let i = 0; i < workUnits; i++) {
        bodyParts.push(WORK);
    }
    
    return this.createCreep(bodyParts, undefined, {role: 'harvester'});
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

StructureSpawn.prototype.createRepairer = function(energy) {
    let bodyUnits = Math.floor(energy / 200);
    let bodyParts = [];
    
    bodyUnits = bodyUnits > 5 ? 5 : bodyUnits;
    for (let i = 0; i < bodyUnits; i++) {
        bodyParts.push(WORK);
        bodyParts.push(MOVE);
        bodyParts.push(CARRY);
    }
    
    return this.createCreep(bodyParts, undefined, {role: 'repairer'});
}

StructureSpawn.prototype.createHauler = function(energy) {
    let bodyUnits = Math.floor(energy / 100);
    let bodyParts = [];
    
    bodyUnits = bodyUnits > 5 ? 5 : bodyUnits;
    for (let i = 0; i < bodyUnits; i++) {
        bodyParts.push(MOVE);
        bodyParts.push(CARRY);
    }
    
    return this.createCreep(bodyParts, undefined, {role: 'hauler'});
}