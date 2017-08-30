/*
 * task Source
 *
 * harvestes energy from the source
 *
 */

var taskSource = {

    // Run the requested task
    run: function() {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            Game.kernel.killProcess(this.pid);
        }

        if (creep.getOffExit()) {
            return true;
        }

        if (creep.isSleep()) {
            creep.moveToIdlePosition();
            return true;
        }

        if ((creep.carryCapacity * 0.8) > _.sum(creep.carry) || creep.carryCapacity == 0) {
            this.doWork(creep);
        } else {
            this.doEmpty(creep);
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    doEmpty: function(creep) {
        let energyTargets = [
            'linkIn',
            'containerIn',
            'spawn',
            'extention',
            'container',
            'containerOut',
            'storage',
        ];

        let source = Game.getObjectById(creep.memory.sourceId);

        if (!creep.memory.goingTo && source) {
            creep.memory.goingTo = source.getLocalContainer();
        }

        creep.doEmpty(energyTargets, RESOURCE_ENERGY);

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    doWork: function(creep) {
        if (creep.room.name != creep.memory.workRoom) {
            creep.moveToRoom(creep.memory.workRoom);
            return true;
        }

        switch (creep.memory.style) {
        case 'drop':
            this.doDropHarvest(creep);
            break;
        default:
            this.doHarvest(creep);
            break;
        }

        return true;
    },

    /**
    * @param {Creep} creep The creep object
    **/
    doHarvest: function(creep) {
        let source = Game.getObjectById(creep.memory.sourceId);

        if (!creep.pos.inRangeTo(source, 1)) {
            creep.goto(source, {
                range: 1,
                maxRooms:1,
                reUsePath: 80,
                maxOps: 4000,
                ignoreCreeps: true,
            });

            return true;
        }

        if (creep.carry[RESOURCE_ENERGY] > 0 && !source.getLocalContainer()) {
            let construction = creep.room.getConstructionAtArea(source.pos, 1);

            if (construction) {
                creep.build(construction);
                return true;
            }
        }

        creep.harvest(source);

        return true;
    },

    doDropHarvest: function(creep) {
        let source = Game.getObjectById(creep.memory.sourceId);

        let target = Game.getObjectById(source.getDropContainer());

        if (!target) {
            source.clearContainer();
            creep.setDespawn();
            return false;
        }

        if (!creep.pos.isEqualTo(target)) {
            creep.goto(target, {
                range: 0,
                maxRooms:1,
                reUsePath: 80,
                maxOps: 4000,
            });
            return true;
        }

        if (_.sum(target.store) >= (target.storeCapacity * C.ENERGY_CONTAINER_MAX_PERCENT)) {
            return true;
        }

        creep.harvest(source);

        return true;
    },

};

registerProcess('tasks/source', taskSource);
