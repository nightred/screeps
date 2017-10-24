/*
 * map managment
 *
 * Manages the loading and creation of maps
 *
 */

var logger = new Logger('[goto]');

if (!Memory.world) Memory.world = {};
if (!Memory.world.avoidRooms) Memory.world.avoidRooms = {};

var gotoModule = {

    resumeTravel: function(creep) {
        let dest = getPos(creep.memory._goto.dest);
        this.travel(creep, dest, {})
    },

    travel: function(creep, target, args = {}) {
        if (!target) return ERR_INVALID_ARGS;

        if (!(target instanceof RoomPosition)) target = target.pos;

        if (creep.room.controller) {
            if (creep.room.controller.owner && !creep.room.controller.my) {
                this.memory.avoidRooms[creep.room.name] = creep.room.controller.level;
            } else {
                this.memory.avoidRooms[creep.room.name] = undefined;
            }
        }

        if (!creep.memory._goto)
            creep.memory._goto = {
                tick: Game.time,
                stuck: 0,
                cpu: 0,
            };

        let gotoData = creep.memory._goto;

        let isStuck = false;
        if (gotoData.last) {
            gotoData.last = getPos(gotoData.last);

            if (!creep.pos.inRangeTo(gotoData.last, 0)) {
                gotoData.stuck = 0;
            } else {
                isStuck = true;
                gotoData.stuck++;
                visualCircle(creep.pos, 'magenta', (gotoData.stuck * 0.1));
            }
        }

        if (gotoData.stuck >= C.GOTO_STUCK_COUNT) {
            delete gotoData.path;
            args.ignoreCreeps = false;
        }

        if (!isStuck && (Game.time - gotoData.tick) > 1)
            delete gotoData.path;

        if (!gotoData.dest || gotoData.dest.roomName !== target.roomName ||
            gotoData.dest.x !== target.x || gotoData.dest.y !== target.y
        ) delete gotoData.path;

        gotoData.tick = Game.time;

        if (creep.fatigue > 0) {
            visualCircle(creep.pos, 'aqua', 0.25);
            return ERR_BUSY;
        }

        if (!gotoData.path) {
            gotoData.dest = target;
            gotoData.last = undefined;

            let cpuStart = Game.cpu.getUsed();

            let route = this.findRoute(creep.pos, target, args);

            gotoData.cpu = (Game.cpu.getUsed() - cpuStart);
            if (gotoData.cpu > C.GOTO_CPU_ALERT)
                logger.alert('high cpu: ' + (gotoData.cpu).toFixed(2) +
                    ', creep: ' + creep.name +
                    ', from: ' + creep.pos + ', to: ' + target
                );

            if (route.incomplete)
                logger.debug('failed to find route, cpu: ' + (gotoData.cpu).toFixed(2) +
                    ', creep: ' + creep.name +
                    ', from: ' + creep.pos + ', to: ' + target
                );

            gotoData.path = serializePath(creep.pos, route.path);
            gotoData.stuck = 0;
        }

        if (!gotoData.path || gotoData.path.length === 0) return ERR_NO_PATH;

        if (gotoData.last && gotoData.stuck === 0)
            gotoData.path = gotoData.path.substr(1);

        gotoData.last = creep.pos;

        let moveDir = parseInt(gotoData.path[0], 10);
        if (gotoData.path.length === 1) delete creep.memory._goto;
        return creep.move(moveDir);
    },

    findRoute: function(start, target, args) {
        _.defaults(args, {
            ignoreCreeps: true,
            range: 1,
            maxOps: C.GOTO_MAXOPS,
            maxRooms: 16,
        });

        let validRooms;
        //if ((args.useFindRoute && start.roomName !== target.roomName) ||
        //    Game.map.getRoomLinearDistance(start.roomName, target.roomName) > 2
        //) validRooms = this.findValidRooms(start.roomName, target.roomName, args);

        let callback = (roomName) => {
            if (validRooms && !validRooms[roomName]) return false;

            if (this.memory.avoidRooms[roomName] && !args.allowAvoid) {
                return false;
            }

            let room = Game.rooms[roomName];
            if (!room) return;

            let costs = this.getMap(room);

            if (!args.ignoreCreeps)
                costs = this.addCreepsToCosts(room, costs.clone());

            return costs;
        };

        return PathFinder.search(start, {pos: target, range: args.range}, {
            roomCallback: callback,
            maxOps: args.maxOps,
            maxRooms: args.maxRooms,
        });
    },

    findValidRooms: function(start, target, args) {
        _.defaults(args, {
            restrictDistance: 16,
            preferHighway: true,
        });

        let validRooms = {
            [start]: true,
            [target]: true,
        };

        let callback = (roomName) => {
            let parsedRoom = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            let xMod = parsedRoom[1] % 10;
            let yMod = parsedRoom[2] % 10;

            if (args.preferHighway) {
                if (xMod === 0 || yMod === 0) return 1;
            }

            if (!args.allowSK) {
                if ((xMod >= 4 && xMod <= 6) &&
                    (yMod >= 4 && yMod <= 6)
                ) return 10;
            }

            if (!args.allowAvoid && this.memory.avoidRooms[roomName] &&
                roomName !== start && roomName !== target
            ) return Number.POSITIVE_INFINITY;

            return 2.5;
        };

        let route = Game.map.findRoute(start, target, {
            routeCallback: callback,
        });

        if (!_.isArray(route)) return;

        for (const record in route) {
            validRooms[record.room] = true;
        }

        return validRooms;
    },

    getMap: function(room) {
        var cacheCosts = mod.cache.getData(C.CACHE.COST_MATRIX);
        if (!cacheCosts.costs) cacheCosts.costs = {};
        if (!cacheCosts.age) cacheCosts.age = {};

        if (!cacheCosts.costs[room.name] || (cacheCosts.age[room.name] &&
            (cacheCosts.age[room.name] + C.GOTO_MAP_CACHE) < Game.time)
        ) {
            let startCPU = Game.cpu.getUsed();
            let costs = new PathFinder.CostMatrix;
            costs = this.addTerrainToCosts(room, costs);
            cacheCosts.costs[room.name] = this.addStructuresToCosts(room, costs);
            cacheCosts.age[room.name] = Game.time;

            logger.debug('rebuilt cost matrix cache for room: ' + room.name +
                ', cpu used: ' + (Game.cpu.getUsed() - startCPU).toFixed(2)
            );
        }

        return cacheCosts.costs[room.name];
    },

    addTerrainToCosts: function(room, costs) {
        for (var x = 0; x < 50; ++x) {
            for (var y = 0; y < 50; ++y) {
                let cost = 2;
                if (x == 0 || x == 49 || y == 0 || y == 49) cost = 25;
                let terrain = Game.map.getTerrainAt(x, y, room.name);
                if (terrain == 'wall') {
                    cost = 0xff;
                } else if (terrain == 'swamp') {
                    cost = 5;
                }

                costs.set(x,y, cost);
            }
        }
        return costs;
    },

    addStructuresToCosts: function(room, costs) {
        for (const structure of room.getStructures()) {
            if (structure instanceof StructureRampart) {
                if (!structure.my && !structure.isPublic)
                    costs.set(structure.pos.x, structure.pos.y, 0xff);
            } else if (structure instanceof StructureRoad) {
                costs.set(structure.pos.x, structure.pos.y, 1);
            } else if (structure.structureType !== STRUCTURE_CONTAINER) {
                costs.set(structure.pos.x, structure.pos.y, 0xff);
            }
        }

        for (const construction of room.getConstructionSites()) {
            if (construction.structureType === STRUCTURE_CONTAINER ||
                construction.structureType === STRUCTURE_ROAD ||
                construction.structureType === STRUCTURE_RAMPART
            ) continue;
            costs.set(construction.pos.x, construction.pos.y, 0xff);
        }

        return costs;
    },

    addCreepsToCosts: function(room, costs) {
        let creeps = room.find(FIND_CREEPS);
        creeps.forEach(creep => costs.set(creep.pos.x, creep.pos.y, 0xff));

        return costs;
    },

    showMap: function(roomName) {
        if (this.memory.avoidRooms[roomName] && !args.allowAvoid) {
            return false;
        }

        let room = Game.rooms[roomName];
        if (!room) return;

        let costs = this.getMap(room);

        costs = this.addCreepsToCosts(room, costs.clone());

        for (var x = 0; x < 50; ++x) {
            for (var y = 0; y < 50; ++y) {
                let cost = costs.get(x,y);
                new RoomVisual(roomName).text(cost, x, (y + 0.4), {
                    color: '#51d181',
                    font: 0.3,
                });
            }
        }

    },

};

Object.defineProperty(gotoModule, 'memory', {
    get: function() {
        return Memory.world;
    },
    set: function(value) {
        Memory.world = value;
    },
});

var getPos = function(pos) {
    return new RoomPosition(pos.x, pos.y, pos.roomName);
};

var serializePath = function(startPos, path) {
    let serialPath = '';
    let lastPos = startPos;

    for (const pos of path) {
        //new RoomVisual(pos.roomName).line(pos, lastPos, { color: 'red', lineStyle: "dashed" });
        if (pos.roomName === lastPos.roomName)
            serialPath += lastPos.getDirectionTo(pos);
        lastPos = pos;
    }

    return serialPath;
};

var visualCircle = function(pos, color, opacity) {
    new RoomVisual(pos.roomName).circle(pos, {
        radius: 0.5,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 0.2,
        opacity: opacity,
    });
};

module.exports = gotoModule;
