/*
 * work Build Room
 *
 *  build room work handles the tasks for room build
 * this covers harvesting, repair, hauling, upgrading, etc
 *
 */

var workUpgrade = {
    
    doManage: function(task) {
        if (!task) { return false; }
        
        task.manageTick = task.manageTick || 0;
        if ((task.manageTick + Constant.MANAGE_WAIT_TICKS) > Game.time) {
            return true;
        }
        task.manageTick = Game.time;
        
        let room = Game.rooms[task.room];
        if (!room) { 
            Work.removeWork(task.id);
            return false;
        }
        
        if (Work.getRoomTaskCount('harvestEnergy', room.name) == 0) {
            Work.addWork('harvestEnergy', room.name, 20, {managed: true,});
        }
        
        if (Work.getRoomTaskCount('service', room.name) > 0) {
            let serviceTask = Work.getRoomTask('service', room.name);
            if (serviceTask) {
                switch (room.controller.level) {
                    case 3:
                    case 4:
                        if (serviceTask.creepLimit < 2) {
                            serviceTask.creepLimit = 2;
                        }
                        break;
                    case 5:
                        if (serviceTask.creepLimit < 3) {
                            serviceTask.creepLimit = 3;
                        }
                }
            } else {
                Work.addWork('service', room.name, 24, {managed: true, creepLimit: 1});
            }
        }
        
        if (room.controller.level > 0) { 
            let upgradeTask = Work.getRoomTask('upgrade', room.name);
            if (upgradeTask) {
                switch (room.controller.level) {
                    case 2:
                    case 3:
                        if (upgradeTask.creepLimit < 2) {
                            upgradeTask.creepLimit = 2;
                        }
                        break;
                    case 4:
                    case 5:
                        if (upgradeTask.creepLimit < 3) {
                            upgradeTask.creepLimit = 3;
                        }
                }
            } else {
                Work.addWork('upgrade', room.name, 26, {managed: true, creepLimit: 1});
            }
        }
        
        if (Work.getRoomTaskCount('haul', room.name) == 0) {
            if (room.getContainers().length > 0) {
                Work.addWork('haul', room.name, 22, {managed: true,});
            }
        }
        
        return true;
    },

};

module.exports = workUpgrade;
