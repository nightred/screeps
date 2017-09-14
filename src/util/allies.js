/*
 * Allies system
 *
 */

var Allies = function() {
    Memory.world = Memory.world || {};
};

Allies.prototype.isAlly = function(name) {
    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    return false;
};

Allies.prototype.addAlly = function(name) {
    Memory.world.allies = Memory.world.allies || [];
    let allies = Memory.world.allies;

    if (allies.indexOf(name.toLowerCase()) >= 0) {
        return true;
    }

    allies.push(name.toLowerCase());
    return true;
};

let allies = new Allies();

global.isAlly = function(name) {
    return allies.isAlly(name);
};

global.addAlly = function(name) {
    return allies.addAlly(name);
}
