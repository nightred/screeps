/*
 * Role Combat Brawler
 *
 * combat brawler role handles melee combat
 *
 */

var roleCombatBrawler = {
    
    workTypes: [
        'defense.melee',
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
        let attackUnits = Math.floor((energy * 0.5) / 80);
        attackUnits = attackUnits < 1 ? 1 : attackUnits;
        attackUnits = attackUnits > 20 ? 20 : attackUnits;
        
        energy -= (attackUnits * 80);
        let moveUnits = Math.floor((energy * 0.7) / 50);
        moveUnits = moveUnits < 1 ? 1 : moveUnits;
        moveUnits = moveUnits > 8 ? 8 : moveUnits;
        
        energy -= (moveUnits * 50);
        let toughUnits = Math.floor(energy / 10);
        toughUnits = toughUnits < 1 ? 1 : toughUnits;
        toughUnits = toughUnits > 18 ? 18 : toughUnits;
        
        let bodyParts = [];
        for (let i = 0; i < toughUnits; i++) {
            bodyParts.push(TOUGH);
        }
        for (let i = 0; i < moveUnits; i++) {
            bodyParts.push(MOVE);
        }
        for (let i = 0; i < attackUnits; i++) {
            bodyParts.push(ATTACK);
        }
        
        return bodyParts;
    },
    
    doSpawn: function(spawn, body) {
        if (!spawn) { return false; }
        if (!body || body.length < 1) { return false; }

        return spawn.createCreep(body, undefined, {role: 'combat.brawler'});
    },
    
    /** @param {Creep} creep **/
    doWork: function(creep) {
        if (!creep) { return false; }
        
        if (!creep.memory.workId) {
            if (creep.getWork(this.workTypes)) {
                creep.say('🥊')
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

module.exports = roleCombatBrawler;
