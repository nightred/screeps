/*
 * Library for sources
 */

var libSources = {

    getSources: function() {
        this.memory.sources = this.memory.sources || [];

        let room = Game.rooms[this.memory.workRoom];
        if (!room) return false;

        let sources = room.getSources();
        if (sources.length <= 0) return true;

        for (let i = 0; i < sources.length; i++) {
            this.memory.sources.push({
                id: sources[i].id,
            });
        }

        return true;
    },

};

module.exports = libSources;
