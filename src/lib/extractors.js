/*
 * Library for extractor
 */

var libExtractors = {

    cacheRoomExtractors: function(room) {
        if (room.memory.sleepExtractorCache && room.memory.sleepExtractorCache > Game.time)
            return;

        room.memory.extractors = [];

        let extractors = room.getExtractors();
        room.memory.extractors = _.map(extractors, r => r.id);

        room.memory.sleepExtractorCache = C.CACHE_SLEEP + Game.time;
    },

    getRoomExtractors: function(room) {
        room.memory.extractors = room.memory.extractors || [];
        return room.memory.extractors;
    },

};

module.exports = libExtractors;
