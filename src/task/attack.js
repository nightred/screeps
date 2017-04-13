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
        task.rally = task.rally || {}

        let flag = Game.flags[task.id + '_target'];
        if (flag) {
            if (task.workRooms[0] != flag.pos.roomName) {
                task.workRooms[0] = flag.pos.roomName;
            }
            task.rally.x = flag.pos.x;
            task.rally.y = flag.pos.y;
            task.rally.room = flag.pos.roomName;
        }

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
        if (creep.heal(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.goto(targets[0], { range: 1, reUsePath: 4, ignoreCreeps: true, });
            creep.rangedHeal(targets[0]);
        }

        return true;
    },

    doAttack: function(creep, task) {
        if (!creep) { return -1; }
        if (!task) { return -1; }
        creep.memory.targetId = creep.memory.targetId || false;

        let flag = Game.flags[task.id + '_target'];
        if (flag) {
            let newTarget = flag.pos.getStructure();
            if (newTarget.structureType) {
                creep.memory.targetId = newTarget.id;
            }
        }
        if (!creep.memory.targetId) {
            let newTarget = this.getTarget(creep);
            if (newTarget) {
                creep.memory.targetId = newTarget.id;
            }
        }

        let target = Game.getObjectById(creep.memory.targetId);
        if (!target) {
            creep.memory.targetId = false;
            return this.doRally(creep, task);
        }

        //let rampart = target.pos.getRampart();
        //target = rampart || target;

        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            let opts = {
                reusePath: 10,
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
            if (!target.StructureType) {
                opts.reusePath = 1;
            }
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
