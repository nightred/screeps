/*
 * Kernel
 *
 * main kernel of the system
 */

var logger = new Logger('[Kernel]');

var processRegistry = {
    registry: {},

    register: function(name, image) {
        this.registry[name] = image;
    },

    getNewProcess: function(name) {
        if (!this.registry[name]) return;
        return new this.registry[name]();
    },
};

global.registerProcess = function(name, image) {
    processRegistry.register(name, image);
    return true;
};

var Kernel = function() {
    this.processCache = {};
};

Object.defineProperty(Kernel.prototype, 'memory', {
    get: function() {
        Memory.kernel = Memory.kernel || {};
        return Memory.kernel;
    },
    set: function(value) {
        Memory.kernel = Memory.kernel || {};
        Memory.kernel = value;
    },
});

Object.defineProperty(Kernel.prototype, 'processTable', {
    get: function() {
        this.memory.processTable = this.memory.processTable || {};
        return this.memory.processTable;
    },
    set: function(value) {
        this.memory.processTable = this.memory.processTable || {};
        this.memory.processTable = value;
    },
});

Object.defineProperty(Kernel.prototype, 'processMemory', {
    get: function() {
        this.memory.processMemory = this.memory.processMemory || {};
        return this.memory.processMemory;
    },
    set: function(value) {
        this.memory.processMemory = this.memory.processMemory || {};
        this.memory.processMemory = value;
    },
});

Kernel.prototype.run = function() {
    addTerminalLog(undefined, {
        command: 'starting kernel',
    });

    let cpuStart = Game.cpu.getUsed();

    let pids = _.pluck(
        _.sortBy(this.processTable, p => p.lastTick)
    , 'pid');

    //let pids = Object.keys(this.processTable);

    if (pids.length === 0) {
        let proc = this.startProcess(undefined, 'loader/init', {});
        if (proc) pids.push(proc.pid);
    }

    let pidCount = pids.length;

    for (let i = 0; i < pidCount; i++) {
        let pid = pids[i];

        let procStartCPU = Game.cpu.getUsed();

        let procInfo = this.processTable[pid];
        if (!procInfo.priority) procInfo.priority = 5;

        if (procInfo.status == 'killed') {
            delete this.processMemory[procInfo.ms];
            delete this.processTable[pid];
            continue;
        }

        if (procInfo.sleep) {
            procInfo.sleep--;
            if (procInfo.sleep > 0) continue;
            procInfo.sleep = undefined;
            procInfo.status = 'running';
        }

        if (procInfo.status !== 'running') continue;

        try {
            let process = this.getProcessByPid(pid);
            if (!process) {
                logger.error(`failed to get process ${procInfo.name} : ${procInfo.pid}`);
                continue;
            }

            process.run();
        } catch (e) {
            procInfo.status = 'crashed';
            procInfo.error = e.stack || e.toString();
            logger.error(`process crashed ${procInfo.name} : ${procInfo.pid}\n${e.stack}`);
        }

        procInfo.cpuUsed = (Game.cpu.getUsed() - procStartCPU);

        if (Game.cpu.getUsed() > Game.cpu.limit && Game.cpu.bucket < 5000) {
            logger.alert('High CPU Usage detected, Bucket is low, exiting kernal early');
            break;
        }
    }

    addTerminalLog(undefined, {
        command: 'kernel',
        status: 'OK',
        cpu: (Game.cpu.getUsed() - cpuStart),
        output: ('process count: ' + pidCount),
    });
};

Kernel.prototype.startProcess = function(parent, imageName, startMem) {
    let pid = getPID();

    let procInfo = {
        pid: pid,
        parentPID: parent && parent.pid || 0,
        name: imageName,
        ms: `${pid}_MS`,
        status: 'running',
        timestamp: Game.time,
        cpuUsed: 0,
        priority: 5,
    };

    this.processTable[pid] = procInfo;
    this.processMemory[procInfo.ms] = startMem || {};

    let process = this.createProcess(pid);

    if (!process) {
        delete this.processTable[pid];
        delete this.processMemory[procInfo.ms];
        return;
    }

    logger.debug(`spawned new process ${procInfo.name} : ${procInfo.pid}`);

    return process;
};

Kernel.prototype.createProcess = function(pid) {
    let procInfo = this.processTable[pid];
    if (!procInfo) {
        logger.error(`process ${pid} is not in the process table`)
        return;
    }

    let process = processRegistry.getNewProcess(procInfo.name);
    if (!process) {
        logger.error(`failed to create process ${procInfo.name}`);
        return;
    }

    let self = this;

    Object.defineProperties(process, {
        pid: {
            writable: false,
            value: procInfo.pid,
        },
        parentPID: {
            writable: false,
            value: procInfo.parentPID,
        },
        imageName: {
            writable: false,
            value: procInfo.name,
        },
        memory: {
            get() {
                self.processMemory[procInfo.ms] = self.processMemory[procInfo.ms] || {};
                return self.processMemory[procInfo.ms];
            },
            set(value) {
                self.processMemory[procInfo.ms] = self.processMemory[procInfo.ms] || {};
                self.processMemory[procInfo.ms] = value;
            },
        },
    });

    this.processCache[pid] = process;

    return process;
};

Kernel.prototype.killProcess = function(pid) {
    if (!this.processTable[pid]) return;
    logger.debug(`killed process ${this.processTable[pid].name} : ${this.processTable[pid].pid}`);
    this.processTable[pid].status = 'killed';

    for (var opid in this.processTable) {
        if (this.processTable[opid].parentPID === pid &&
            this.processTable[opid].stats !== 'killed') {
            this.killProcess(opid)
        }
    }
};

Kernel.prototype.setParent = function(pid, parentPID = 0) {
    if (!this.processTable[pid]) return;
    if (parentPID === undefined) parentPID = 0;
    this.processTable[pid].parentPID = parentPID;
};

Kernel.prototype.sleepProcessbyPid = function(pid, sleepTime) {
    if (this.processTable[pid]) {
        this.processTable[pid].status = 'sleep';
        this.processTable[pid].sleep = sleepTime;
    }
};

Kernel.prototype.getProcessByPid = function(pid) {
    return this.processTable[pid] && (this.processCache[pid] || this.createProcess(pid));
};

var getPID = function() {
    return 'P_' + Math.random().toString(32).slice(2) + Game.time.toString(32);
};

module.exports = Kernel;
