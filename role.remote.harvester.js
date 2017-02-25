/*
 * Remote Harvester Role
 *
 * remote harvester role that handles energy harvesting in remote rooms
 *
 */
 
var roleRemoteHarvester = {
    
    workTypes: [
        'remote.harvest',
        ],

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep) { return false; }
        
        if (creep.manageState()) {
            if (!creep.memory.working) {
                creep.say('⛏️');
            } else {
               if (creep.memory.harvestTarget) {
                   let source = Game.getObjectById(creep.memory.harvestTarget);
                   source.removeHarvester();
               }
            }
        }
        
        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        this.doWork(creep);
        
        return true;
    },
    
    /** @param {Creep} creep **/
    doWork: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.workId) {
            if (!creep.getWork(this.workTypes)) {
                creep.memory.idleStart = Game.time;
                creep.say('💤');
                
                return false;
            }
        }
        
        if (!creep.doWork()) {
            if (Constant.DEBUG >= 2) { console.log("DEBUG - " + this.memory.role + " " + this.name + ' failed doWork'); }
        }
        
        return true;
    },
    
    getBody: function(energy) {
        let workUnits = Math.floor((energy * 0.5) / 100);  // 100
        let moveUnits = Math.floor((energy * 0.3) / 50);  // 50
        let carryUnits = Math.floor((energy * 0.2) / 50); // 50
        let bodyParts = [];
        
        workUnits = workUnits < 1 ? 1 : workUnits;
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        carryUnits = carryUnits < 1 ? 1 : carryUnits;
        
        workUnits = workUnits > 5 ? 5 : workUnits;
        moveUnits = moveUnits > 15 ? 15 : moveUnits;
        carryUnits = carryUnits > 24 ? 24 : carryUnits;
        
        for (let i = 0; i < workUnits; i++) {
            bodyParts.push(WORK);
        }
        for (let i = 0; i < moveUnits; i++) {
            bodyParts.push(MOVE);
        }
        for (let i = 0; i < carryUnits; i++) { 
            bodyParts.push(CARRY);
        }
        
        return bodyParts;
    },
    
    doSpawn: function(spawn, body) {
        if (!spawn) { return false; }
        if (!body || body.length < 1) { return false; }
        
        return spawn.createCreep(body, undefined, { role: 'remote.harvester', });
    },
    
};

module.exports = roleRemoteHarvester;
