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
    
    init: function() {
        // init
    },
    
    run: function(room) {
        
        if (!this.isUnitsInRoomMax(room, 'harvester')) {
            QSpawn.addQueue(room.name, 'harvester', 50);
        }
        if (!this.isUnitsInRoomMax(room, 'upgrader')) {
            QSpawn.addQueue(room.name, 'upgrader', 80);
        }
        if (!this.isUnitsInRoomMax(room, 'hauler')) {
            QSpawn.addQueue(room.name, 'hauler', 70);
        }
        if (!this.isUnitsInRoomMax(room, 'service')) {
            QSpawn.addQueue(room.name, 'service', 60);
        }
        
        return true;
    },
    
    getRoomMax: function(room, role) {
        if (!room) { return false; }
        if (Constant.ROLE_TYPES.indexOf(role) < 0) { return false; }
        
        return room.memory.limits[role];
    },
    
    getUnitsInRoomByRole: function(room, role) {
        if (!room) { return false; }
        if (Constant.ROLE_TYPES.indexOf(role) < 0) { return false; }
        
        return _.filter(Game.creeps, creep => 
            creep.memory.role == role && 
            creep.room.name == room.name &&
            creep.memory.despawn != true
            );
    },
    
    isUnitsInRoomMax: function(room, role) {
        if (!room) { return false; }
        if (Constant.ROLE_TYPES.indexOf(role) < 0) { return false; }
        let count = this.getUnitsInRoomByRole(room, role).length;
        count += QSpawn.getQueueInRoomByRole(room.name, role).length;
        
        return count >= this.getRoomMax(room, role);
    },
    
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
            if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load role: ' + roleName + ', error: ' + e); }
        }
        
        return role;
    },
    
}

module.exports = manageRole;
