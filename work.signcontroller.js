/*
 * work Sign Controller
 *
 * signcontroller work handles set the message on the controller
 *
 */

var workSignController = {

    run: function(creep, work) {
        if (!creep) { return false; }
        if (!work) { return false; }
        
        let target = Game.rooms[work.room].controller;
        if (!target) { return creep.removeWork(); }
        let message = work.message;
        
        this.doWork(creep, target, message);
        if (this.checkWork(target, message)) { return creep.removeWork(); }
        
        return true;
    },
    
    doWork: function(creep, target, message) {
        if (!creep) { return false; }
        if (!target) { return false; }
        if (!message) { return false; }
        
        if (creep.signController(target, message) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        
        return true;
    },
    
    checkWork: function(target, message) {
        if (!target) { return false; }
        if (!message) { return false; }
        
        if (!target.sign) { return false; }
        if (target.sign.text != message) { return false; }
        
        return true;
    },
    
};

module.exports = workSignController;