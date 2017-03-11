/*
 * role managment
 *
 * Provides functions for each role
 *
 * max: the spawn limit
 * run: the default function for the role
 * units: list all creeps of the role
 * isMax: is the role at the spawn limit
 *
 */

var manageRole = {

    doRole: function(creep) {
        if (!creep) { return false; }
        if (Constant.ROLE_TYPES.indexOf(creep.memory.role) < 0) { return false; }

        let role = this.getRole(creep.memory.role);
        if (!role) { return false; }

        try {
        	return role.doRole(creep);
        } catch(e) {
        	if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to run role: ' + creep.memory.role + ', error:\n' + e); }
        }

        return false;
    },

    getRole: function(name) {
        if (Constant.ROLE_TYPES.indexOf(name) < 0) { return false; }
        let role = false;

        try {
            role = require('role.' + name);
        } catch(e) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name + ', error:\n' + e); }
        }

        return role;
    },

}

module.exports = manageRole;
