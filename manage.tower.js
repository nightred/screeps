/*
 * Tower managment
 *
 * Provides functions for towers
 *
 */
 
var manageTower = {
    
    run: function(room)  {
        var towers = global.cacheFind.towers(room);
        
        if (towers.length > 0) {
            towers.forEach((tower) => manageTower.tower(tower));
        }
    },
    
    tower: function(tower) {
        
        var hostiles = _.sortBy(tower.room.find(FIND_HOSTILE_CREEPS), (hostile) => hostile.hits);
        var creeps = _.sortBy(_.sortBy(tower.room.find(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitMax
        }), (creep) => tower.pos.getRangeTo(creep)), (creep) => creep.hits);
        var repairs = _.sortBy(tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType != STRUCTURE_WALL &&
                    structure.structureType != STRUCTURE_RAMPART) ||
                    (structure.structureType == STRUCTURE_RAMPART &&
                    structure.hits < 2000)) &&
                    structure.hits < structure.hitsMax
            }
        }), s => s.hits / s.hitsMax);

        
        if (hostiles.length > 0) {
            tower.attack(hostiles[0]);
        } else if (creeps.length > 0) {
            tower.heal(creeps[0]);
        } else if (repairs.length > 0) {
            tower.repair(repairs[0]);
        }
    }
};

module.exports = manageTower;