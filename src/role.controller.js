/*
 * Role Controller
 *
 * scout role handles traveling to other rooms and having a look around
 *
 */

var roleController = {
    
    workTypes: [
        'room.claim',
        'room.reserve',
        ],

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.idleStart > (Game.time - Constant.CREEP_IDLE_TIME)) {
            creep.moveToIdlePosition();
            
            return false;
        }
        
        this.doWork(creep);
        
    },
    
    getBody: function(energy) {
        let bodyParts = [];
        
        bodyParts.push(MOVE);
        bodyParts.push(MOVE);
        bodyParts.push(MOVE);
        bodyParts.push(MOVE);
        bodyParts.push(CLAIM);
        
        return bodyParts;
    },
    
    doSpawn: function(spawn, body) {
        if (!spawn) { return false; }
        if (!body || body.length < 1) { return false; }

        return spawn.createCreep(body, undefined, {role: 'controller'});
    },
    
    /** @param {Creep} creep **/
    doWork: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.workId) {
            if (creep.getWork(this.workTypes)) {
                creep.say('⛳')
            } else {
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
    
};

module.exports = roleController;
