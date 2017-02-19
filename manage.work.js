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
    
    createWork: {
        
        run: function(room) {
            if (!room) { return false; }
            this.memory = Memory.work;
            this.memory.timeFindWork = this.memory.timeFindWork || Game.time;
            this.memory.timeWorkReport = this.memory.timeWorkReport || Game.time;
            
            if ((this.memory.timeFindWork + Constant.WORK_FIND_WAIT) < Game.time) {
                this.repair(room);
                this.build(room);
                this.refillTower(room);
                
                this.memory.timeFindWork = Game.time;
            }
            
            if ((this.memory.timeWorkReport + Constant.WORK_REPORT_WAIT) < Game.time) {
                Work.reportWork();
                this.memory.timeWorkReport = Game.time;
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
                if (Work.addWork(task, roomName, priority, targets[i].id)) { count++; }
            }
            if (count && Constant.DEBUG >= 2) { console.log('DEBUG - added ' + count + ' ' + task + ' work to the queue'); }
            
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
    
    reportWork: function() {
        
        console.log('╔═══════════════════════════════════════════════════════');
        console.log('║ * REPORT - work queued and in progress by type');
        
        for (let i = 0; i < Constant.WORK_TYPES.length; i++) {
            let countWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task
                ).length;
            let activeWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task &&
                work.creeps.length > 0
                ).length;
            
            console.log('║ * ' + Constant.WORK_TYPES[i] + ' has ' + countWork + ' jobs in queued, ' + activeWork + ' are in progress');
        }
        
        console.log('╚═══════════════════════════════════════════════════════');
        
        return true;
    },
    
    /*
    * @param [tasks] array of tasks
    */
    getWork: function(tasks, roomName) {
        if (!Array.isArray(tasks)) { return false; }
        if (!roomName) { return false; }
        
        let targets = _.sortBy(_.filter(this.memory.workQueue, work => 
            tasks.indexOf(work.task) >= 0 &&
            work.room == roomName &&
            ((!work.multiCreep && work.creeps.length == 0) ||
            (work.multiCreep && work.creeps.length < work.multiCreepLimit))
            ), work => work.priority);
        if (!targets.length > 0) { return false; }
        
        return targets[0].id;
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
        if (!work.multiCreep && work.creeps.length > 0) { return false; }
        if (work.multiCreep && 
            work.creeps.length >= work.multiCreepLimit) { 
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
    * @param perpetual job never ends default:false
    * @param multiCreep several creep on the job default:false
    * @param multiCreepLimit max creeps default:1
    */
    addWork: function(task, roomName, priority, targetId, perpetual, multiCreep, multiCreepLimit) {
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        if (!roomName) { return false; }
        
        targetId = typeof targetId !== 'undefined' ? targetId : false;
        priority = typeof priority !== 'undefined' ? priority : 100;
        multiCreep = typeof multiCreep !== 'undefined' ? multiCreep : false;
        multiCreepLimit = typeof multiCreepLimit !== 'undefined' ? multiCreepLimit : 1;
        perpetual = typeof perpetual !== 'undefined' ? perpetual : false;
        
        if (this.hasWorkTypeByTargetId(targetId, task)) { return false; }
        
        let workId = this.getQueueId();
        let work = {
            id: workId,
            creeps: [],
            multiCreep: multiCreep,
            room: roomName,
            task: task,
            priority: priority,
        };
        
        if (targetId) { work.targetId = targetId; }
        if (multiCreep) { work.multiCreepLimit = multiCreepLimit; }
        if (perpetual) { work.perpetual = perpetual; }
        
        this.memory.workQueue[workId] = work;
        
        return workId;
    },
    
    removeWork: function(workId) {
        if (!this.memory.workQueue[workId]) { return true; }
        
        if (Constant.DEBUG >= 3) { console.log('DEBUG - removing ' + this.memory.workQueue[workId].task + ' work id: ' + workId + ' for id: ' + this.memory.workQueue[workId].targetId); }
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
        this.memory.queueID = this.memory.queueID < 999999999 ? this.memory.queueID : 0;
        
        return (++ this.memory.queueID);
    },
    
    doWork: function(creep) {
        if (!creep) { return false; }
        
        let work = this.memory.workQueue[creep.memory.workId];
        if (!work) { return false; }
        
        try {
            let workTask = require('work.' + work.task);
            return workTask.run(creep, work);
        } catch(e) {
            if (Constant.DEBUG >= 2) { console.log('DEBUG - ' + creep.name + ' failed to load work task: ' + work.task + ' error: ' + e); }
        }
        
        return false;
    },
    
};

module.exports = manageWork;

