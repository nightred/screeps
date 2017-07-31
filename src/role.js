/*
 * Role managment
 *
 * This manages the roles for creeps
 */

var Role = function() {
    this.roles = {};
    for (let i = 0; i < C.ROLE_TYPES.length; i++) {
        this.roles[C.ROLE_TYPES[i]] = this.getRole(C.ROLE_TYPES[i]);
    }
};

Role.prototype.getBody = function(role, energy, args) {
    if (C.ROLE_TYPES.indexOf(role) < 0) { return false; }
    if (isNaN(energy)) { return ERR_INVALID_ARGS; }
    args = args || {};

    return this.roles[role].getBody(energy, args);
};

Role.prototype.getRole = function(name) {
    if (C.ROLE_TYPES.indexOf(name) < 0) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name); }
        return ERR_INVALID_ARGS;
    }

    let role = false;
    try {
        role = require('role.' + name);
    } catch(e) {
        if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name + ', error:\n' + e); }
    }
    return role;
};

module.exports = Role;
