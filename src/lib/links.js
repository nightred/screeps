/*
 * Library for links
 */

var logger = new Logger('[LibLinks]');
logger.level = C.LOGLEVEL.DEBUG;

var libLinks = {

    doLinks: function(room) {
        let linksStorage = this.getRoomLinksStorage(room);
        if (linksStorage.length === 0) return;

        let storageLink = Game.getObjectById(linksStorage[0]);
        if (!storageLink) return;

        let linksIn = this.getRoomLinksIn(room);
        for (let i = 0; i < linksIn.length; i++) {
            let link = Game.getObjectById(linksIn[i]);
            if (!link) continue;

            if (link.energy > (link.energyCapacity * C.ENERGY_LINK_IN_MIN) &&
                link.cooldown == 0
            ) {
                link.transferEnergy(storageLink);
            }
        }

        let linkStorageMin = storageLink.energyCapacity * C.LINK_STORAGE_TRANSFER_MIN;

        let linksOut = this.getRoomLinksOut(room);
        for (let i = 0; i < linksOut.length; i++) {
            if (storageLink.cooldown != 0) break;
            if (storageLink.energy < linkStorageMin) break;

            let link = Game.getObjectById(linksOut[i]);
            if (!link) continue;

            if (link.energy < (link.energyCapacity * C.LINK_OUT_MAX_ENERGY)) {
                storageLink.transferEnergy(link);
                break;
            }
        }
    },

};

module.exports = libLinks;
