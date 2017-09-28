/*
 * cache managment
 *
 * Manages the loading and running of work
 *
 */

var logger = new Logger('[Cache]');
logger.level = C.LOGLEVEL.DEBUG;

var CacheModule = {

    cache: {},

    getData: function(key) {
        if (!this.cache[key]) {
            this.cache[key] = {
                data: {},
                tick: 1,
            };
        }

        return this.cache[key].data;
    },

    getAge: function(key) {
        if (!this.cache[key]) return false;
        return Game.time - this.cache[key].tick;
    },

    isOld: function(key) {
        if (!this.cache[key] || !this.cache[key].tick) return true;
        return (this.cache[key].tick + C.CACHE_SLEEP) < Game.time;
    },

    markFresh: function(key) {
        if (!this.cache[key]) return;
        this.cache[key].tick = Game.time;
    },

    clearData: function(key) {
        if (this.cache[key]) delete this.cache[key];
    },

};

module.exports = CacheModule;
