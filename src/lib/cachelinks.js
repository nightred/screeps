/*
 * Library for links
 */

var logger = new Logger('[LibCacheLinks]');
logger.level = C.LOGLEVEL.DEBUG;

var libCacheLinks = {

    cacheRoomLinks: function(room) {
        if (room.memory.sleepLinkCache && room.memory.sleepLinkCache > Game.time)
            return;

        room.memory.linksIn = [];
        room.memory.linksOut = [];
        room.memory.linksStorage = [];

        let links = room.getLinks();

        let linksIn = _.filter(links, structure =>
            structure.memory.type == 'in'
        );
        room.memory.linksIn = _.map(linksIn, r => r.id);

        let linksOut = _.filter(links, structure =>
            structure.memory.type == 'out'
        );
        room.memory.linksOut = _.map(linksOut, r => r.id);

        let linksStorage = _.filter(links, structure =>
            structure.memory.type == 'storage'
        );
        room.memory.linksStorage = _.map(linksStorage, r => r.id);

        room.memory.sleepLinkCache = C.CACHE_SLEEP + Game.time;
    },

    getRoomLinksIn: function(room) {
        room.memory.linksIn = room.memory.linksIn || [];
        return room.memory.linksIn;
    },

    getRoomLinksOut: function(room) {
        room.memory.linksOut = room.memory.linksOut || [];
        return room.memory.linksOut;
    },

    getRoomLinksStorage: function(room) {
        room.memory.linksStorage = room.memory.linksStorage || [];
        return room.memory.linksStorage;
    },

};

module.exports = libCacheLinks;
