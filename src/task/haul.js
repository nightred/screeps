/*
 * task Haul
 *
 * haul manages the moving of resources
 *
 */

var taskHaul = {

    /**
    * @param {Creep} creep The creep object
    **/
    run: function(creep) {
        if (!creep) { return ERR_INVALID_ARGS; }

        if (creep.manageState()) {
            if (creep.memory.working) {
                creep.say('🚚');
            } else {
                creep.say('🔋');
            }
        } else if (!creep.memory.working && creep.carry.energy > (creep.carryCapacity * 0.2))  {
            creep.toggleState();
            creep.say('🚚');
        }

        switch (creep.memory.style) {
        case 'longhauler':
            this.doLongHaul(creep);
            break;
        default:
            this.doHaul(creep);
            break;
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    doLongHaul: function(creep) {
        if (Game.cpu.bucket < 500) {
            return true;
        }

        if (creep.memory.working) {
            if (creep.pos.isOnRoad()) {
                let road = creep.pos.getRoad();
                if (road.hits < road.hitsMax) {
                    creep.repair(road);
                }
            } else if (creep.pos.isOnConstruction()) {
                creep.build(creep.pos.getConstruction());
            }

            if (creep.room.name != creep.memory.spawnRoom) {
                creep.moveToRoom(creep.memory.spawnRoom);
                return true;
            }

            let energyOutTargets = [
                'storage',
                'spawn',
                'extention',
            ];

            if (!creep.room.storage ||
                (creep.room.controller && creep.room.controller.my &&
                creep.room.controller.level < 4)) {
                energyOutTargets.push('containerOut');
                energyOutTargets.push('container');
            }

            if (!creep.doEmpty(energyOutTargets, RESOURCE_ENERGY)) {
                if (C.DEBUG >= 2) { console.log('DEBUG - do empty energy failed for role: ' + creep.memory.role + ', name: ' + creep.name); }
            }
        } else {
            if (creep.room.name != creep.memory.workRooms[0]) {
                creep.moveToRoom(creep.memory.workRooms[0]);
                return true;
            }

            let energyInTargets = [
                'containerIn',
            ];

            creep.doFill(energyInTargets, RESOURCE_ENERGY);
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    doHaul: function(creep) {
        if (!creep) { return false; }

        // working has energy, else need energy
        if (creep.memory.working) {
            let energyOutTargets = [
                'spawn',
                'storage',
            ];

            if (!creep.room.storage || 
                (creep.room.controller && creep.room.controller.my &&
                creep.room.controller.level < 4)) {
                energyOutTargets = [
                    'extention',
                    'spawn',
                    'containerOut',
                    'container',
                ];
            }

            creep.doEmpty(energyOutTargets, RESOURCE_ENERGY);
        } else {
            let energyInTargets =  [
                'containerIn',
            ];

            creep.doFill(energyInTargets, RESOURCE_ENERGY);
        }

        return true;
    },

};

module.exports = taskHaul;
