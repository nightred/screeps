/*
 * Director system
 *
 * handles the managed tasks
 *
 */

var Director = function() {
    if (!Memory.director) {
        Memory.director = {};
    }

    if (!Memory.director.db) {
        Memory.director.db = {};
    }

    if (!Memory.director.ver || Memory.director.ver != C.VERSION) {
        Memory.director = {};
        Memory.director.db = {};
        Memory.director.ver = C.VERSION;
    }

    this.memory = Memory.director;
    this.db = Memory.director.db;

    this.directors = {};

    for (let i = 0; i < C.DIRECTOR_TYPES.length; i++) {
        let director = this.loadDirector(C.DIRECTOR_TYPES[i]);

        if (director != undefined) {
            this.directors[C.DIRECTOR_TYPES[i]] = new director;
        }
    }
};

Director.prototype.loadDirector = function(name) {
    if (C.DIRECTOR_TYPES.indexOf(name) == -1) {
        if (C.DEBUG >= 2) { console.log('DEBUG - unknown director: ' + name); }
        return ERR_INVALID_ARGS;
    }

    let director = undefined;

    try {
        director = require('director.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load director: ' + name + ', error:\n' + e); }
    }

    return director;
};

Director.prototype.run = function() {
    for (let id in this.db) {
        let record = this.db[id];

        this.runDirector(record);
    }
};

Director.prototype.runDirector = function(task) {
    if (!task) { return ERR_INVALID_ARGS; }

    if (task.sleep && task.sleep > Game.time) {
        return true;
    }

    return this.directors[task.director].run(task);
}

Director.prototype.addCreep = function(id, creepName) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }
    if (!creepName) { return ERR_INVALID_ARGS; }

    let director = this.db[id];

    if (!director) {
        return false;
    }

    if (director.creep.indexOf(creepName) != -1) {
        return true;
    }

    director.creep.push(creepName);

    if (C.DEBUG >= 3) { console.log('VERBOSE - director ' + director.director + ' adding creep: ' + creepName); }

    return true;
};

Director.prototype.delCreep = function(id, creepName) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }
    if (!creepName) { return ERR_INVALID_ARGS; }

    let director = this.db[id];

    if (!director) {
        return false;
    }

    let index = director.creep.indexOf(creepName);

    if (index == -1) {
        return true;
    }

    director.creep.splice(index, 1);

    if (C.DEBUG >= 3) { console.log('VERBOSE - director ' + director.director + ' removing creep: ' + creepName); }

    return true;
};

Director.prototype.addRecord = function(args) {
    if (!args ||
        !args.workRoom ||
        !args.spawnRoom ||
        C.DIRECTOR_TYPES.indexOf(args.director) == -1) {
        return ERR_INVALID_ARGS;
    }

    args.priority = args.priority || 100;

    let id = this.getId();

    let record = {
        id: id,
        tick: Game.time,
    };

    for (let item in args) {
        record[item] = args[item];
    };

    this.db[id] = record;

    if (C.DEBUG >= 3) { console.log('VERBOSE - director task added, type: ' + record.director + ', priority: ' + record.priority); }

    return id;
};

Director.prototype.delRecord = function(id) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }

    if (!this.db[id]) {
        return true;
    }

    return delete this.db[id];
};

Director.prototype.getRecord = function(id) {
    if (isNaN(id)) { return ERR_INVALID_ARGS; }

    return this.db[id];
};

Director.prototype.getId = function() {
    this.memory.lastId = this.memory.lastId || 0;

    if (this.memory.lastId >= 999999) {
        this.memory.lastId = 0;
    }

    let newId = this.memory.lastId + 1;

    while (true) {
        if (!this.db[newId]) {
            break;
        }

        newId ++;
    }

    this.memory.lastId = newId;

    return newId;
};

Director.prototype.doFlag = function(flag) {
    if (!flag) { return ERR_INVALID_ARGS; }

    if (flag.memory.init) {
        return true;
    }

    let flagName = flag.name;
    let flagVars = flagName.split(':');

    let roomName = flag.pos.roomName;

    if (C.DIRECTOR_FLAG_TYPES.indexOf(flagVars[1]) == -1) {
        flag.memory.result = 'invalid task';
        return false;
    }

    flag.memory.directorId = this.directors[flagVars[1]].flag(roomName, flagVars);

    flag.memory.init = 1;

    return true;
};

module.exports = Director;
