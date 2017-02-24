/*
 * work Scout
 *
 * scoutd work handles traveling to other rooms to look around
 *
 */

var workScout = {

    run: function(creep, work) {
        if (!creep) { return false; }
        if (!work) { return false; }
        
        let target = new RoomPosition(25, 25, work.room);
        if (!target) { return creep.removeWork(); }

        this.doWork(creep, target);
        
        return true;
    },
    
    doWork: function(creep, target) {
        if (!creep) { return false; }
        if (!target) { return false; }
        
        if (creep.moveTo(target, { range: 12, }) == ERR_NO_PATH) {
            return creep.removeWork();
        }

        return true;
    },
    
};

module.exports = workScout;
