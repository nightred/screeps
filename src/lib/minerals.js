/*
 * Library for minerals
 */

var libMinerals = {

    cacheRoomMinerals: function(room) {
        if (room.memory.initMinerals)
            return;

        room.memory.minerals = [];

        let minerals = room.getMinerals();
        room.memory.minerals = _.map(minerals, r => r.id);

        room.memory.initMinerals = 1;
    },

    getRoomMinerals: function(room) {
        room.memory.minerals = room.memory.minerals || [];
        return room.memory.minerals;
    },

};

module.exports = libMinerals;
