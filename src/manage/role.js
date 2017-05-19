/*
 * Role managment
 *
 * This manages the roles for creeps
 */

var manageRole = function() {
    this.roles = {};
    for (let i = 0; i < C.ROLE_TYPES.length; i++) {
        this.roles[C.ROLE_TYPES[i]] = this.getRole(C.ROLE_TYPES[i]);
    }
};

manageRole.prototype.doRole = function(creep) {
    if (!creep) { return false; }
    if (C.ROLE_TYPES.indexOf(creep.memory.role) < 0) { return false; }

    return this.roles[creep.memory.role].doRole(creep);
};

manageRole.prototype.getBody = function(role, energy, args) {
    if (C.ROLE_TYPES.indexOf(role) < 0) { return false; }
    if (isNaN(energy)) { return -1; }
    args = args || {};

    return this.roles[role].getBody(energy, args);
};

manageRole.prototype.doSpawn = function(role, spawn, body, args) {
    if (C.ROLE_TYPES.indexOf(role) < 0) { return false; }
    if (!spawn) { return -1; }
    if (!body) { return -1; }
    args = args || {};

    return this.roles[role].doSpawn(spawn, body, args);
};

manageRole.prototype.getRole = function(name) {
    if (C.ROLE_TYPES.indexOf(name) < 0) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name); }
        return -1;
    }

    let role = false;
    try {
        role = require('role.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name + ', error:\n' + e); }
    }
    return role;
};

module.exports = manageRole;
