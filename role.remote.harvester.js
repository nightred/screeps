/*
 * Remote Harvester Role
 *
 * remote harvester role that handles energy harvesting in remote rooms
 *
 */
 
var roleRemoteHarvester = {

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
    
    getBody: function(energy) {
        let bodyParts = [];
        let extrasCost = 100;
        
        bodyParts.push(MOVE);
        bodyParts.push(CARRY);
        
        let workUnits = Math.floor((energy - extrasCost) / 100);
        workUnits = workUnits > 5 ? 5 : workUnits;
        for (let i = 0; i < workUnits; i++) {
            bodyParts.push(WORK);
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
