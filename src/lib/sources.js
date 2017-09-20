/*
 * Library for sources
 */

var libSources = {

    cacheRoomSources: function(room) {
        if (room.memory.initSources)
            return;

        room.memory.sources = [];

        let sources = room.getSources();
        room.memory.sources = _.map(sources, r => r.id);

        room.memory.initSources = 1;
    },

    getRoomSources: function(room) {
        room.memory.sources = room.memory.sources || [];
        return room.memory.sources;
    },

};

module.exports = libSources;
