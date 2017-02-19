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
            
            let targets = _.filter(room.getTowers(), structure =>
                structure.energy < (structure.energyCapacity * Constant.REFILL_TOWER_MIN)
                );
            
            if (targets.length < 1) {
                return false;
            }
            
            let count = 0;
            for (let i = 0; i < targets.length; i++) {
                if (Work.addWork(targets[i].id, 'refillTower', 20)) { count++; }
            }
            if (count && Constant.DEBUG) { console.log('DEBUG - added ' + count + ' refillTower work to the queue'); }
            
            return true;
        },
        
        build: function(room) {
            if (!room) { return false; }
            
            let targets = room.getConstructionSites();
            
            if (targets.length < 1) {
                return false;
            }
            
            let count = 0;
            for (let i = 0; i < targets.length; i++) {
                if (Work.addWork(targets[i].id, 'build', 80)) { count++; }
            }
            if (count && Constant.DEBUG) { console.log('DEBUG - added ' + count + ' build work to the queue'); }
            
            return true;
        },
        
        repair: function(room) {
            if (!room) { return false; }
            
            let targets = _.sortBy(_.filter(room.find(FIND_MY_STRUCTURES), structure =>
                    structure.hits < (structure.hitsMax * Constant.REPAIR_HIT_WORK_MIN)
                    ), structure => structure.hits / structure.hitsMax);
                
            _.filter(room.find(FIND_STRUCTURES), structure => 
                (structure.structureType == STRUCTURE_CONTAINER || 
                structure.structureType == STRUCTURE_ROAD) &&
                (structure.structureType != STRUCTURE_WALL &&
                structure.structureType != STRUCTURE_RAMPART) &&
                structure.hits < (structure.hitsMax * Constant.REPAIR_HIT_WORK_MIN)
                ).forEach(structure => targets.push(structure));
            
            if (targets.length < 1) {
                return false;
            }
            
            let count = 0;
            for (let i = 0; i < targets.length; i++) {
                if (Work.addWork(targets[i].id, 'repair', 60)) { count++; }
            }
            if (count && Constant.DEBUG) { console.log('DEBUG - added ' + count + ' repair work to the queue'); }
            
            return true;
        },
        
    },
    
    reportWork: function() {
        
        console.log('#######################################################');
        console.log(' * REPORT - work queued and in progress by type');
        
        for (let i = 0; i < Constant.WORK_TYPES.length; i++) {
            let countWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task
                ).length;
            let activeWork = _.filter(this.memory.workQueue, work => 
                Constant.WORK_TYPES[i] == work.task &&
                work.creeps.length > 0
                ).length;
            
            console.log(' * ' + Constant.WORK_TYPES[i] + ' has ' + countWork + ' jobs in queued, ' + activeWork + ' are in progress');
        }
        
        console.log('#######################################################');
        
        return true;
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
    
    hasWork: function(targetId, task) {
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
    addWork: function(targetId, task, priority, perpetual, multiCreep, multiCreepLimit) {
        if (!targetId) { return false; }
        if (Constant.WORK_TYPES.indexOf(task) < 0) { return false; }
        
        priority = typeof priority !== 'undefined' ? priority : 100;
        multiCreep = typeof multiCreep !== 'undefined' ? multiCreep : false;
        multiCreepLimit = typeof multiCreepLimit !== 'undefined' ? multiCreepLimit : 1;
        perpetual = typeof perpetual !== 'undefined' ? perpetual : false;
        
        if (this.hasWork(targetId, task)) { return false; }
        
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
        
        if (Constant.DEBUG) { console.log('DEBUG - removing ' + this.memory.workQueue[workId].task + ' work id: ' + workId + ' for id: ' + this.memory.workQueue[workId].targetId); }
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
            if (Constant.DEBUG) { console.log('DEBUG - failed to load work task: ' + role + ' error: ' + e); }
        }
        
        return false;
    },
    
};

module.exports = Work;

