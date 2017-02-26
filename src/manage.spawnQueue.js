/*
 * spawn queue system
 *
 * creates a spawn queue and provisions the tasks
 *
 */

var manageSpawnQueue = {

    init: function() {
        if (!Memory.spawn) { Memory.spawn = {}; }
        if (!Memory.spawn.queue) { Memory.spawn.queue = {}; }
        this.memory = Memory.spawn;
        
        let queue = this.getQueueSpawning();
        if (queue.length > 0) {
            for(let i = 0; i < queue.length; i++) {
                if (!Game.creeps[queue[i].name]) {
                    if (Constant.DEBUG >= 3) { console.log('VERBOSE - spawn queue removing id: ' + queue[i].id + ', role: ' + queue[i].role + ', room: ' + queue[i].room + ', name: ' + queue[i].name + ', missing from game'); }
                    this.delQueueId(queue[i].id);
                }
                if (Game.creeps[queue[i].name] && !Game.creeps[queue[i].name].spawning) {
                    if (Constant.DEBUG >= 3) { console.log('VERBOSE - spawn queue removing id: ' + queue[i].id + ', role: ' + queue[i].role + ', room: ' + queue[i].room + ', name: ' + queue[i].name + ', spawned'); }
                    this.delQueueId(queue[i].id);
                }
            }
        }
    },
    
    run: function(room) {
        let energy = room.energyAvailable;
        if (energy < Constant.ENERGY_CREEP_SPAWN_MIN) { return false; }

        let queue = this.getQueue(room.name);
        if (!queue) { return false; }
        
        let spawns = room.getSpawns();
        if (!spawns) { return false; }
        
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].minSize) {
                if (queue[i].minSize > energy) { continue; }
            }
            
            let role = this.getRole(queue[i].role);
            
            let body = undefined;
            try {
            	body = role.getBody(energy);
            } catch(e) {
            	if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to get body for role: ' + queue[i].role + ', error:\n' + e); }
            }
            let cost = this.getBodyCost(body);
            let name = undefined;
            
            for (let s = 0; s < spawns.length; s++) {
                if (spawns[s].spawning) { continue; }
                try {
                	name = role.doSpawn(spawns[s], body);
                } catch(e) {
                	if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to do spawn for role: ' + queue[i].role + ', error:\n' + e); }
                }
                
                if (name != undefined && !(name < 0)) {
                    energy -= cost;
                    break;
                }
            }
            
            if (name != undefined && !(name < 0)) {
                queue[i].isSpawning = true;
                queue[i].name = name;
                if (Constant.DEBUG >= 1) { console.log('INFO - spawning ' + queue[i].role + ', named ' + name + ' with ' + Game.creeps[name].body.length + ' parts for ' + cost + ' energy in ' + room.name); }
            }
            if (energy < Constant.ENERGY_CREEP_SPAWN_MIN) { break; }
        }
        
        return true;
    },
    
    doManage: function() {
        // manage
        
        return true;
    },
    
    getReport: function() {
        
        let report = '║ * spawn queue\n';
        
        for (let i = 0; i < Constant.ROLE_TYPES.length; i++) {
            let countRole = _.filter(this.memory.queue, item => 
                Constant.ROLE_TYPES[i] == item.role
                ).length;
            if (countRole > 0) {
                report += '║ - ' + countRole + ' ' + Constant.ROLE_TYPES[i] + ' role creep in queue \n';
            }
        }
        
        return report;
    },
    
    getQueue: function(roomName) {
        if (!roomName) { return false; }
        
        let items = _.filter(this.memory.queue, item => 
            item.room == roomName &&
            item.isSpawning != true
            );
        if (items.length < 1 || !items) { return false; }
        
        items = _.sortBy(items, items => items.priority);
        
        return items;
    },
    
    getQueueSpawning: function() {
        let items = _.filter(this.memory.queue, item => 
            item.isSpawning == true
            );
        if (items.length < 1 || !items) { return false; }
        
        return items;
    },
    
    getQueueInRoomByRole: function(roomName, role) {
        if (!roomName) { return false; }
        if (Constant.ROLE_TYPES.indexOf(role) < 0) { return false; }
        
        return _.filter(this.memory.queue, item => 
            item.room == roomName &&
            item.role == role
            );
    },
    
    getQueueId: function() {
        this.memory.queueID = this.memory.queueID || 0;
        this.memory.queueID = this.memory.queueID < 999999 ? this.memory.queueID : 0;
        
        return (++ this.memory.queueID);
    },
    
    addQueue: function(roomName, role, priority, minSize) {
        if (!roomName) { return false; }
        if (Constant.ROLE_TYPES.indexOf(role) < 0) { return false; }
        
        priority = typeof priority !== 'undefined' ? priority : 100;
        minSize = typeof minSize !== 'undefined' ? minSize : false;
        
        let queueId = this.getQueueId();
        let queueItem = {
            id: queueId,
            room: roomName,
            priority: priority,
            tick: Game.time,
            role: role,
        };
        
        if (minSize) { queueItem.minSize = minSize; }
        
        this.memory.queue[queueId] = queueItem;
        if (Constant.DEBUG >= 3) { console.log('VERBOSE - spawn queue added id: ' + queueId + ', role: ' + role + ', room: ' + queueItem.room); }
        
        return queueId;
    },
    
    delQueueId: function(queueId) {
        if (!queueId) { return false; }
        if (!this.memory.queue[queueId]) { return true; }
        if (Constant.DEBUG >= 3) { console.log('VERBOSE - spawn queue removed id: ' + queueId + ', role: ' + this.memory.queue[queueId].role + ', room: ' + this.memory.queue[queueId].room); }
        
        delete this.memory.queue[queueId];
        
        return true;
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
    
    getBodyCost: function(body) {
        if (!body) { return false; }
        
        let cost = 0;
        for (let i = 0; i < body.length; i++) {
            cost += BODYPART_COST[body[i]];
        }
        
        return cost;
    },
    
};

module.exports = manageSpawnQueue;
