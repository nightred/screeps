/*
 * Work managment system
 *
 * creates a work queue and provisions the tasks
 *
 */

var manageWork = {

    init: function() {
        if (!Memory.work) { Memory.work = {}; }
        if (!Memory.work.workQueue) { Memory.work.workQueue = {}; }
        this.memory = Memory.work;
    },
    
    doManage: function() {
        let list = this.getManagedWork();
        if (!list || list.length < 0) { return false; }
        
        for (let i = 0; i < list.length; i++) {
            let task = this.getTask(list[i].task);
            if (!task) { continue; }
            
            task.doManage(list[i]);
        }
        
        return true;
    },
    
    createWork: {
        
        run: function(room) {
            if (!room) { return false; }
            this.memory = Memory.work;
            this.memory.timeFindWork = this.memory.timeFindWork || Game.time;
            
            if ((this.memory.timeFindWork + Constant.WORK_FIND_WAIT) < Game.time) {
                this.repair(room);
                this.build(room);
                this.refillTower(room);
                
                this.memory.timeFindWork = Game.time;
            }
            
            return true;
        },
        
        refillTower: function(room) {
            if (!room) { return false; }
            let task = 'refillTower';
            
            return this.addWork(this.findWork(room, task), task, room.name, 30);
        },
        
        build: function(room) {
            if (!room) { return false; }
            let task = 'build';
            
            return this.addWork(this.findWork(room, task), task, room.name, 80);
        },
        
        repair: function(room) {
            if (!room) { return false; }
            let task = 'repair';
            
            return this.addWork(this.findWork(room, task), task, room.name, 60);
        },
        
        addWork: function(targets, task, roomName, priority) {
            if (targets.length < 1) { return false; }
            if (!task) { return false; }
            if (!roomName) { return false; }
            priority = typeof priority !== 'undefined' ? priority : 100;
            
            let count = 0;
            for (let i = 0; i < targets.length; i++) {
                if (Work.hasWorkTypeByTargetId(targets[i].id, task)) { continue; }
                let args = { targetId: targets[i].id, };
                if (Work.addWork(task, roomName, priority, args)) { count++; }
            }
            if (count && Constant.DEBUG >= 2) { console.log('DEBUG - added ' + count + ' ' + task + ' tasks to the queue'); }
            
            return true;
        },
        
        findWork: function(room, task) {
            if (!room) { return false; }
            if (!task) { return false; }
            
            try {
                let workTask = require('work.' + task);
                return workTask.findWork(room);
            } catch(e) {
                if (Constant.DEBUG >= 2) { console.log('DEBUG - ' + task + ' failed to load find work, error: ' + e); }
            }
            
            return false;
        },
        
    },
    
    getReport: function() {
        
        let report = '║ * work queued and in progress by type\n';
        
        for (let i = 0; i < Constant.WORK_TYPES.length; i++) {
            let countWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task &&
                work.managed
                ).length;
                
            if (countWork > 0) {
                report += '║ - ' + countWork + ' managed ' + Constant.WORK_TYPES[i] + ' task(s) in progress\n';
            }
        }
        
        for (let i = 0; i < Constant.WORK_TYPES.length; i++) {
            let countWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task &&
                !work.managed
                ).length;
            let activeWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task &&
                work.creeps.length > 0 &&
                !work.managed
                ).length;
            
            if (countWork > 0) {
                report += '║ - ' + Constant.WORK_TYPES[i] + ' has ' + countWork + ' task(s) in queued, ' + activeWork + ' are in progress\n';
            }
        }
        
        return report;
    },
    
    /*
    * @param [tasks] array of tasks
    */
    getCreepWork: function(tasks, roomName) {
        if (!Array.isArray(tasks)) { return false; }
        if (!roomName) { return false; }
        
        let targets = _.sortBy(_.filter(this.memory.workQueue, work => 
            tasks.indexOf(work.task) >= 0 &&
            work.room == roomName &&
            ((!work.multiCreep && work.creeps.length == 0) ||
            (work.multiCreep && work.creeps.length < work.multiCreepLimit))
            ), work => work.priority);
        if (!targets.length > 0 || !targets) { return false; }
        
        return targets[0].id;
    },
    
    getRoomTaskCount: function(task, roomName) {
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        if (!roomName) { return false; }
        
        return _.filter(this.memory.workQueue, work => 
            work.task == task &&
            work.room == roomName
            ).length;
    },
    
    getRoomTask: function(task, roomName) {
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        if (!roomName) { return false; }
        
        let tasks = _.filter(this.memory.workQueue, work => 
            work.task == task &&
            work.room == roomName
            );
        if (!tasks.length > 0) { return false; }
        
        return tasks[0];
    },
    
    getManagedWork: function() {
        let list = _.sortBy(_.filter(this.memory.workQueue, work => 
            work.managed
            ), work => work.priority);
        if (!list.length > 0 || !list) { return false; }
        
        return list;
    },
    
    /*
    * @param creepId the creep that will do the work
    * @param workId the id of the work to be done
    */
    setWork: function(creepName, workId) {
        if (!creepName) { return false; }
        if (!workId) { return false; }
        
        let work = this.memory.workQueue[workId];
        if (!work) {
            this.removeWork(workId);

            return false;
        }
        if (!work.multiCreep) {
            if (work.creeps.length > 0) { return false; }
        } else if (work.creeps.length >= work.multiCreepLimit) { 
            return false; 
        }
        
        work.creeps.push(creepName);
        
        return true;
    },
    
    checkWorkId: function(workId) {
        if (this.memory.workQueue[workId]) { return true; }
        
        return false;
    },
    
    hasWorkTypeByTargetId: function(targetId, task) {
        if (!targetId) { return false; }
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        
        return _.filter(this.memory.workQueue, work => 
            task == work.task &&
            work.targetId == targetId
            ).length > 0 ? true : false;
    },
    
    /*
    * @param required targetId the target of the work
    * @param required task the type of work based on the WORK_TYPES constant
    * @param priority lower is first default:100
    * @param args further values supported by work
    */
    addWork: function(task, roomName, priority, args) {
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        if (!roomName) { return false; }
        priority = typeof priority !== 'undefined' ? priority : 100;
        args = args || {};
        
        let queueId = this.getQueueId();
        let queueItem = {
            id: queueId,
            room: roomName,
            priority: priority,
            task: task,
            creeps: [],
        };
        
        if (args.targetId) { queueItem.targetId = args.targetId; }
        if (args.managed) { queueItem.managed = args.managed; }
        if (args.creepLimit) { queueItem.creepLimit = args.creepLimit; }
        if (args.multiCreep) {
            queueItem.multiCreep = args.multiCreep;
            queueItem.multiCreepLimit = args.multiCreepLimit;
        }
        
        this.memory.workQueue[queueId] = queueItem;
        if (Constant.DEBUG >= 3) { console.log('VERBOSE - work adding task: ' + queueItem.task + ', id: ' + queueId + ', room: ' + queueItem.room); }
        
        return queueId;
    },
    
    delQueue: function() {
        console.log('INFO - work queue has been droped, rebuilding active work...');
        delete this.memory.workQueue;
        
        return true;
    },
    
    removeWork: function(workId) {
        if (!this.memory.workQueue[workId]) { return true; }
        
        if (Constant.DEBUG >= 3) { console.log('VERBOSE - work removing task: ' + this.memory.workQueue[workId].task + ', id: ' + workId + ', room: ' + this.memory.workQueue[workId].room); }
        delete this.memory.workQueue[workId];
        
        return true;
    },
    
    leaveWork: function(creepName, workId) {
        if (!creepName) { return false; }
        if (!workId) { return false; }
        
        let work = this.memory.workQueue[workId];
        if (!work) { return false; }
        
        for (let i = 0; i < work.creeps.length; i++) {
            if (work.creeps[i] == creepName) {
                work.creeps.splice(i, 1);
                break;
            }
        }
    },
    
    getQueueId: function() {
        this.memory.queueID = this.memory.queueID || 0;
        this.memory.queueID = this.memory.queueID < 999999 ? this.memory.queueID : 0;
        
        return (++ this.memory.queueID);
    },
    
    doWork: function(creep) {
        if (!creep) { return false; }
        
        let work = this.memory.workQueue[creep.memory.workId];
        if (!work) { return false; }
        
        let task = this.getTask(work.task);
        if (!task) { return false; }
        
        return task.run(creep, work);
    },
    
    getTask: function(task) {
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        let work = false;
        
        try {
            work = require('work.' + task);
        } catch(e) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - failed to load work task: ' + work.task + ', error:\n' + e); }
        }
        
        return work;
    },
    
};

module.exports = manageWork;

