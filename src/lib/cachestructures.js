/*
 * cache library for Structures
 */

var logger = new Logger('[LibCacheStructures]');

var libCacheStructures = {

    getCacheStructures: function() {
        var globalStructures = mod.cache.getData(C.CACHE.STRUCTURES);
        if (mod.cache.isOld(C.CACHE.STRUCTURES)) {
            logger.debug('rebuilding structure cache');

            globalStructures = {};
            globalStructures = _.reduce(Game.structures, (acc, s) => {
                const roomRef = acc[s.room.name] || (acc[s.room.name] = {});
                const typeRef = roomRef[s.structureType] || (roomRef[s.structureType] = []);
                typeRef.push(s);
                return acc;
            }, {});

            mod.cache.markFresh(C.CACHE.STRUCTURES);
        }

        return globalStructures;
    },

    /**
    * @param {roomName} roomName the name of the room to return
    **/
    getCacheRoomStructures: function(roomName) {
        return this.getCacheStructures()[roomName];
    },

};

module.exports = libCacheStructures;
