/*
 * map managment
 *
 * Manages the loading and creation of maps
 *
 */

var logger = new Logger('[Map]');
logger.level = C.LOGLEVEL.DEBUG;

var MapModule = {

    getMap: function(roomName) {
        let costs = new PathFinder.CostMatrix;
            for (let x = 0; x < 50; ++x) {
                for (let y = 0; y < 50; ++y) {
                    let cost;
                    let terrain = Game.map.getTerrainAt(x,y,roomName);
                    if (terrain == 'wall') {
                        cost = 255;
                    } else if (terrain == 'swamp') {
                        cost = 2;
                    } else {
                        cost = 1;
                    }
                    if (x == 0 || x == 49 || y == 0 || y == 49) {
                        cost = 254;
                    }
                    costs.set(x,y, cost);
                }
            }
        return costs;
    }

};

module.exports = MapModule;
