/*
 * Tower managment
 *
 * Provides functions for towers
 *
 */

var manageTower = {

    doRoom: function(room)  {
        var towers = room.getTowers();

        if (towers.length > 0) {
            towers.forEach((tower) => manageTower.tower(tower));
        }
    },

    tower: function(tower) {

        if (this.defence(tower)) {
            return true;
        }
        if (this.heal(tower)) {
            return true;
        }
        if (this.repair(tower)) {
            return true;
        }

        return false;

    },

    defence: function(tower) {
        let targets = tower.room.getHostiles();
        if (!targets || targets.length == 0) { return false; }
        targets = _.sortBy(targets, hostile => hostile.hits);

        tower.attack(targets[0]);

        return true
    },

    heal: function(tower) {
        let targets = tower.room.getCreeps();
        if (!targets || targets.length == 0) { return false; }
        targets = _.filter(targets, creep => creep.hits < creep.hitsMax);
        if (!targets || targets.length == 0) { return false; }
        targets = _.sortBy(targets, creep => creep.hits);

        tower.heal(targets[0]);

        return true;
    },

    repair: function(tower) {
        tower.memory.repairTick = tower.memory.repairTick || 0;
        if ((tower.memory.repairTick + C.TOWER_REPAIR_TICKS) > Game.time) {
            return true;
        }
        tower.memory.repairTick = Game.time;

        let mod = 0;
        if (tower.room.storage) {
            let energyStorage = tower.room.storage.store[RESOURCE_ENERGY];
            if (energyStorage < 200000) {
                mod = 1;
            } else if (energyStorage < 400000) {
                mod = 5;
            } else if (energyStorage < 800000) {
                mod = 10;
            } else if (energyStorage < 900000) {
                mod = 20;
            } else if (energyStorage >= 900000) {
                mod = 99;
            }
        }

        let maxHitRampart = C.RAMPART_HIT_MAX * mod;
        let maxHitWall = C.WALL_HIT_MAX * mod;

        let structures = tower.room.getStructures();
        if (!structures || structures.length == 0) { return false; }
        let targets = [];
        _.filter(structures, structure =>
            (structure.structureType != STRUCTURE_WALL &&
            structure.structureType != STRUCTURE_RAMPART) &&
            structure.hits < Math.floor(structure.hitsMax * 0.3)
            ).forEach(structure => targets.push(structure));
        _.filter(structures, structure =>
            (structure.structureType == STRUCTURE_RAMPART &&
            (structure.hits < maxHitRampart &&
            structure.hitsMax > structure.hits)) ||
            (structure.structureType == STRUCTURE_WALL &&
            (structure.hits < maxHitWall &&
            structure.hitsMax > structure.hits))
            ).forEach(structure => targets.push(structure));

        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure =>
            (tower.pos.getRangeTo(structure) + 1) * (structure.hits / structure.hitsMax));

        tower.repair(targets[0]);

        return true;
    },

};

module.exports = manageTower;
