/*
 * Work managment system
 *
 * creates a work queue and provisions the tasks
 *
 */

var Work = {

    init: function() {
        if (!Memory.work) { Memory.work = {}; }
        if (!Memory.work.workQueue) { Memory.work.workQueue = {}; }
        this.memory = Memory.work;
    },
    
    createWork: {
        
        run: function(room) {
            if (!room) { return false; }
            
            this.repair(room);
            
            return true;
        },
        
        repair: function(room) {
            //
        },
        
    },
    
    /*
    * @param [tasks] array of tasks
    */
    getWork: function(tasks) {
        if (!Array.isArray(tasks)) { return false; }
        
        let targets = _.sortBy(_.filter(this.memory.workQueue, work => 
            tasks.indexOf(work.task) >= 0 &&
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
    setWork: function(creepId, workId) {
        if (!creepId) { return false; }
        if (!workId) { return false; }
        
        let work = this.memory.workQueue[workId];
        if (!work) { return false;}
        if (!work.multiCreep && work.creeps.length > 0) { return false; }
        if (work.multiCreep && 
            work.creeps.length >= work.multiCreepLimit) { 
            return false; 
        }
        
        work.creeps.push(creepId);
        
        return true;
    },
    
    checkWorkId: function(workId) {
        if (this.memory.workQueue[workId]) { return true; }
        
        return false;
    },
    
    /*
    * @param required targetId the target of the work
    * @param required task the type of work based on the WORK_TYPES constant
    * @param priority lower is first default:100
    * @param perpetual job never ends default:false
    * @param multiCreep several creep on the job default:false
    * @param multiCreepLimit max creeps default:1
    */
    addWork: function(targetId, task, priority, perpetual, multiCreep, multiCreepLimit) {
        if (!targetId) { return false; }
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        
        priority = typeof priority !== 'undefined' ? priority : 100;
        multiCreep = typeof multiCreep !== 'undefined' ? multiCreep : false;
        multiCreepLimit = typeof multiCreepLimit !== 'undefined' ? multiCreepLimit : 1;
        perpetual = typeof perpetual !== 'undefined' ? perpetual : false;
        
        let workId = this.getQueueId();
        this.memory.workQueue[workId] = {
            id: workId,
            targetId: targetId,
            creeps: [],
            multiCreep: multiCreep,
            multiCreepLimit: multiCreepLimit,
            task: task,
            priority: priority,
            perpetual: perpetual,
        };
        
        return workId;
    },
    
    removeWork: function(workId) {
        if (!this.memory.workQueue[workId]) { return true; }
        
        delete this.memory.workQueue[workId];
        if (Constant.DEBUG) {
            console.log("DEBUG - removing work: " + workId);
        }
        
        return true;
    },
    
    getQueueId: function() {
        this.memory.queueID = this.memory.queueID || 0;
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
            if (Constant.DEBUG) {
                console.log('DEBUG - failed to load work task: ' + role + ' error: ' + e);
            }
        }
        
        return false;
    },
    
};

module.exports = Work;

