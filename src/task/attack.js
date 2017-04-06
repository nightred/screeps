/*
 * task Attack
 *
 * attack travels to a room and destroys all items in it
 *
 */

var taskAttack = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (task.workRooms.length <= 0) {
            if (C.DEBUG >= 2) { console.log('DEBUG - missing work rooms on task: ' + task.task + ', id: ' + task.id); }
            return false;
        }

        if (creep.room.name != task.workRooms[0]) {
            creep.moveToRoom(task.workRooms[0]);
            return true;
        }

        switch(creep.memory.role) {
            case C.COMBAT_MEDIC:
                this.doHeal(creep, task);
                break;
            default:
                this.doAttack(creep, task);
        }

        return true;
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        if (!task) { return -1; }

        return true;
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        if (!room) { return -1; }
        // task creation for the room
    },

    doRally: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (task.rally) {
            if (task.rally.room == creep.room.name &&
                task.rally.x && task.rally.y)  {
                // marker
            }
            let rallyPos = new RoomPosition(task.rally.x, task.rally.y, task.rally.room);
            creep.goto(rallyPos, { reusePath: 5, maxRooms: 1, });
        } else {
            creep.moveToIdlePosition();
        }
        return true;
    },

    doHeal: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        let targets = _.sortBy(_.filter(creep.room.find(FIND_MY_CREEPS), creep =>
            creep.hits < creep.hitsMax
            ), creep => creep.hits);

        if (targets.length <= 0) {
            return this.doRally(creep, task);
        }

        targets = _.sortBy(targets, target => creep.pos.getRangeTo(target.pos));
        if (creep.rangedHeal(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.goto(targets[0], { range: 3, reUsePath: 4, ignoreCreeps: true, });
        }

        return true;
    },

    doAttack: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }

        if (!creep.memory.targetId) {
            let flag = Game.flags[task.id + '_target'];
            let newTarget = false;
            if (flag) {
                newTarget = flag.pos.getStructure();
            } else {
                newTarget = this.getTarget(creep);
            }
            if (newTarget) {
                creep.memory.targetId = newTarget.id;
            }
        }

        let target = Game.getObjectById(creep.memory.targetId);
        if (!target) {
            creep.memory.targetId = false;
            return this.doRally(creep, task);
        }

        let rampart = target.pos.getRampart();
        target = rampart || target;

        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            let opts = {
                reusePath: 1,
                ignoreCreeps: true,
                maxRooms: 1,
                visualizePathStyle: {
                    fill: 'transparent',
                    stroke: '#ff1919',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .2,
                },
            };
            if (creep.goto(target, opts) == ERR_NO_PATH) {
                let path = creep.pos.findPathTo(target, {
                    maxOps: 1000,
                    ignoreDestructibleStructures: true,
                    ignoreCreeps: true,
                    maxRooms: 1, });

                if (path.length) {
                    creep.memory.targetId = creep.getDestructibleStructures(path);
                    return true;
                }

            }
        }

        return true;
    },

    getTarget: function(creep) {
        if (!creep) { return -1; }

        let targets = creep.room.getHostileStructures()
        targets = _.filter(targets, target =>
            target.structureType == STRUCTURE_TOWER);
        if (targets.length > 0) {
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
            return targets[0];
        }
        targets = creep.room.getHostiles();
        if (targets.length > 0) {
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
            return targets[0];
        }
        targets = creep.room.getHostileSpawns()
        if (targets.length > 0) {
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
            return targets[0];
        }
        targets = creep.room.getHostileStructures()
        if (targets.length > 0) {
            targets = _.filter(targets, target =>
                target.structureType != STRUCTURE_CONTROLLER);
            targets = _.sortBy(targets, target => creep.pos.getRangeTo(target));
            return targets[0];
        }

        return false;
    },

};

module.exports = taskAttack;
