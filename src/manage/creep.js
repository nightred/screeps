/*
 * Creep spawn managment
 *
 * Checks how many creeps are active
 * Spawns new creeps to fill out numbers as needed
 *
 * Priority:
 *  harvester, upgrader, builder, hauler, repairer
 *
 */

// managment modules
var manageRole      = require('manage.role');

var manageCreep = {

    cleanCreeps: function() {
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                if (Memory.creeps[name].workId) {
                    Game.Queues.work.removeCreep(name, Memory.creeps[name].workId);
                }
                if (C.DEBUG >= 2) { console.log('DEBUG - clearing non-existant creep memory name: ' + name + ' role: ' + Memory.creeps[name].role); }
                delete Memory.creeps[name];
            }
        }

        return true;
    },

    doManage: function() {
        this.cleanCreeps();

        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (!creep.memory.role || creep.spawning) { continue; }
            if (creep.isDespawnWarning()) {
                this.doDespawn(creep);
                continue;
            }

            manageRole.doRole(creep);
        }

    },

    doDespawn: function(creep) {
        if (!creep) { return false; }

        if (!creep.memory.despawn || creep.memory.despawn == undefined) {
            creep.setDespawn();
        }

        if (creep.getOffExit()) { return true; }
        if (creep.memory.spawnRoom && creep.room.name != creep.memory.spawnRoom) {
            creep.moveToRoom(creep.memory.spawnRoom);
            return true;
        }

    	if (!creep.room.getSpawn()) { return false; }

        if (creep.room.getDespawnContainer()) {
            creep.memory.goingTo = creep.room.getDespawnContainer();
        }

        if (!creep.memory.goingTo) {
            this.getDespawnContainer(creep);
        } else {
            this.doDespawnOnContainer(creep);
        }

        return true;
    },

    doDespawnOnContainer: function(creep) {
        if (!creep) { return false; }

        let target = Game.getObjectById(creep.memory.goingTo);
        if (!target) {
            creep.memory.goingTo = false;
            return false;
        }

        if (creep.pos.x == target.pos.x && creep.pos.y == target.pos.y) {
            if (creep.room.memory.deSpawnContainerId && creep.room.memory.spawnId) {
                if (C.DEBUG >= 1) { console.log("INFO - recycling " + creep.memory.role + " " + creep.name); }
                let roomSpawn = Game.getObjectById(creep.room.getSpawn());
                roomSpawn.recycleCreep(creep);
            } else {
                creep.suicide();
            }
        }

        creep.moveTo(target.pos.x, target.pos.y);

        return true;
    },

    getDespawnContainer: function(creep) {
        if (!creep) { return false; }

        let targets = creep.room.getContainers();
        if (targets.length == 0) {
            creep.suicide();

            return false;
        }
        targets = _.sortBy(targets, structure => creep.pos.getRangeTo(structure));

        return creep.setGoingTo(targets[0]);
    },

};

module.exports = manageCreep;
