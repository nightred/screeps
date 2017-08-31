/*
 * Mil system
 *
 */

var Mil = function() {
    Memory.world = Memory.world || {};
};

Mil.prototype.isAlly = function(name) {
    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Mil.prototype.isEnemy = function(name) {
    Memory.world.enemys = Memory.world.enemys || [];
    let enemies = Memory.world.enemys;

    if (enemys.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Mil.prototype.addAlly = function(name) {
    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    allies.push(name.toLowerCase());
    return true;
};

Mil.prototype.addEnemy = function(name) {
    Memory.world.enemys = Memory.world.enemys || [];
    let enemys = Memory.world.enemys;

    if (enemys.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    enemys.push(name.toLowerCase());
    return true;
};

let mil = new Mil();

global.isAlly = function(name) {
    return mil.isAlly(name);
};

global.isEnemy = function(name) {
    return mil.isEnemy(name);
};

global.addAlly = function(name) {
    return mil.addAlly(name);
}

global.addEnemy = function(name) {
    return mil.addEnemy(name);
}
