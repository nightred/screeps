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
        
        return role.run(creep);
    },
    
    getRole: function(roleName) {
        if (Constant.ROLE_TYPES.indexOf(roleName) < 0) { return false; }
        let role = false;
        
        try {
            role = require('role.' + roleName);
        } catch(e) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + roleName + ', error:\n' + e); }
        }
        
        return role;
    },
    
}

module.exports = manageRole;
