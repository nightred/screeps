/*
 * Tower managment
 *
 * Provides functions for towers
 *
 */

var manageTower = {

    run: function(room)  {
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
        let targets = _.sortBy(tower.room.find(FIND_HOSTILE_CREEPS), (hostile) => hostile.hits);

        if (targets.length > 0) {
            tower.attack(targets[0]);

            return true
        }

        return false;
    },

    heal: function(tower) {
        let targets = _.sortBy(_.filter(tower.room.find(FIND_MY_CREEPS), creep =>
            creep.hits < creep.hitsMax
            ), creep => creep.hits);

        if (targets.length > 0) {
            tower.heal(targets[0]);

            return true;
        }

        return false;
    },

    repair: function(tower) {
        let targets = _.sortBy(tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType != STRUCTURE_WALL &&
                    structure.structureType != STRUCTURE_RAMPART) ||
                    (structure.structureType == STRUCTURE_RAMPART &&
                    structure.hits < C.RAMPART_HIT_MAX)) &&
                    structure.hits < Math.floor(structure.hitsMax * 0.3)
            }
        }), structure => structure.hits / structure.hitsMax);
        _.filter(tower.room.find(FIND_STRUCTURES), structure =>
            (structure.structureType == STRUCTURE_RAMPART &&
            structure.hits < C.RAMPART_HIT_MAX) ||
            (structure.structureType == STRUCTURE_WALL &&
            structure.hits < C.WALL_HIT_MAX)
            ).forEach(structure => targets.push(structure));

        if (targets.length == 0) { return false; }
        targets = _.sortBy(targets, structure => tower.pos.getRangeTo(structure));
        targets = _.sortBy(targets, structure => structure.hits);

        tower.repair(targets[0]);

        return true;
    },

};

module.exports = manageTower;
