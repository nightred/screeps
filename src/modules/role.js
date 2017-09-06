/*
 * Role managment
 *
 * This manages the roles for creeps
 */

var logger = new Logger('[Role]');
logger.level = C.LOGLEVEL.DEBUG;

// load the roles
require('modules.role.combat.brawler');
require('modules.role.combat.militia');
require('modules.role.controller');
require('modules.role.fieldtech');
require('modules.role.hauler');
require('modules.role.miner');
require('modules.role.resupply');
require('modules.role.stocker');
require('modules.role.tech');
require('modules.role.upgrader');

// registry of roles
var roleRegistry = {
    registry: {},

    register: function(roleName, roleImage) {
        this.registry[roleName] = roleImage;
    },

    getRole: function(roleName) {
        if (!this.registry[roleName]) return;
        return this.registry[roleName];
    },
};

global.registerRole = function(roleName, roleImage) {
    roleRegistry.register(roleName, roleImage);
    return true;
};

global.getRoleBody = function(roleName, energy, args) {
    if (isNaN(energy)) { return ERR_INVALID_ARGS; }

    args = args || {};

    let role = roleRegistry.getRole(roleName);

    if (!role) {
        logger.error('failed to load body for role ' + roleName);
        return false;
    }

    return role.getBody(energy, args);
};
