/*
 * Role managment
 *
 * This manages the roles for creeps
 */

var Logger = require('util.logger');

var logger = new Logger('[Role]');
logger.level = C.LOGLEVEL.DEBUG;

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

    if (!this.roles[role]) {
        return false;
    }

    return this.roles[role].getBody(energy, args);
};

Role.prototype.getRole = function(name) {
    if (C.ROLE_TYPES.indexOf(name) < 0) {
        logger.warn('invalid role: ' + name + ' load requested');

        return ERR_INVALID_ARGS;
    }

    let role = undefined;
    try {
        role = require('role.' + name);
    } catch(e) {
        logger.error('failed to load role: ' + name + ', error:\n' + e);
    }
    return role;
};

module.exports = Role;
