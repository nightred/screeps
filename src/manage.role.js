/*
 * role managment
 *
 * Provides functions for each role
 *
 */

var manageRole = {

    doRole: function(creep) {
        if (!creep) { return false; }
        if (C.ROLE_TYPES.indexOf(creep.memory.role) < 0) { return false; }

        let role = this.getRole(creep.memory.role);
        if (!role) { return false; }

        try {
        	return role.doRole(creep);
        } catch(e) {
        	if (C.DEBUG >= 2) { console.log('DEBUG - failed to run role: ' + creep.memory.role + ', error:\n' + e); }
        }

        return false;
    },

    getRole: function(name) {
        if (C.ROLE_TYPES.indexOf(name) < 0) { return false; }
        let role = false;

        try {
            role = require('role.' + name);
        } catch(e) {
            if (C.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + name + ', error:\n' + e); }
        }

        return role;
    },

}

module.exports = manageRole;
