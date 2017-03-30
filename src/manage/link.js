/*
 * Link Managment
 *
 * link managment controls transfering energy between links
 *
 */

var Link = function() {
    // init
};

Link.prototype.manage = function(room) {
    if (!room) { return -1; }

    let links = room.getLinks();
    if (links.length <= 0) { return true; }

    let linksStorage = _.filter(links, structure => structure.memory.type == 'storage');
    if (linksStorage.length <= 0) { return true; }
    let linkStorage = linksStorage[0];
    if (linksStorage.length > 1) {
        if (C.DEBUG >= 2) { console.log('DEBUG - room: ' + room.name + ' has more then one storage link'); }
    }

    let linksIn = _.filter(links, structure => structure.memory.type == 'in');
    let linksOut = _.filter(links, structure => structure.memory.type == 'out');

    if (linksIn.length > 0) {
        for (let i = 0; i < linksIn.length; i++) {
            if (linksIn[i].energy > (linksIn[i].energyCapacity * C.ENERGY_LINK_IN_MIN) &&
                linksIn[i].cooldown == 0) {
                linksIn[i].transferEnergy(linkStorage);
            }
        }
    }

    if (linksOut.length > 0 && linkStorage.cooldown == 0 && linkStorage.energy > 0 ) {
        for (let i = 0; i < linksOut.length; i++) {
            if (linksOut[i].energy < (linksOut[i].energyCapacity * C.ENERGY_LINK_OUT_MAX)) {
                linkStorage.transferEnergy(linksOut[i]);
                break;
            }
        }
    }

    return true;
};

Link.prototype.setType = function(id, type) {
    if (!id) { return -1; }
    if (!type) { return -1; }

    let link = game.getObjectById(id);
    if (!link) { return false; }

    link.memory.type = type;

    return true;
}


module.exports = Link;
