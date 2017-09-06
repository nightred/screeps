/*
 * Kernel
 *
 * main kernel of the system
 */

var logger = new Logger('[Kernel]');
logger.level = C.LOGLEVEL.DEBUG;

// load processes
require('processes.registry');

var processRegistry = {
    registry: {},

    register: function(name, imageName) {
        this.registry[name] = imageName;
    },

    getNewProcess: function(name) {
        if (!this.registry[name]) return;

        return new this.registry[name]();
    },
};

global.registerProcess = function(name, imageName) {
    processRegistry.register(name, imageName);
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

    let pids = Object.keys(this.processTable);

    if (pids.length === 0) {
        let p = this.startProcess(undefined, 'loader/init', {});
        if (p) pids.push(pid.toString());
    }

    for (let i = 0; i < pids.length; i++) {
        let pid = pids[i];

        let procStartCPU = Game.cpu.getUsed();

        let procInfo = this.processTable[pid];

        if (procInfo.status == 'killed') {
            delete this.processMemory[procInfo.ms];
            delete this.processTable[pid];
        }

        if (procInfo.status !== 'running') continue;

        try {
            let process = this.getProcessByPid(pid);

            if (!process) {
                throw new Error(`failed to get process ${procInfo.name} : ${procInfo.pid}`);
                continue;
            }

            process.run();

            procInfo.lastTick = Game.cpu.getUsed();
        } catch (e) {
            procInfo.status = 'crashed';
            procInfo.error = e.stack || e.toString();
            logger.error(`process crashed ${procInfo.name} : ${procInfo.pid}\n${e.stack}`);
        }

        procInfo.cpuUsed = (Game.cpu.getUsed() - procStartCPU);
    }
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
    };

    this.processTable[pid] = procInfo;
    this.processMemory[procInfo.ms] = startMem || {};

    let process = this.createProcess(pid);

    logger.info(`spawned new process ${procInfo.name} : ${procInfo.pid}`);

    return process;
};

Kernel.prototype.createProcess = function(pid) {
    let procInfo = this.processTable[pid];

    if (!procInfo || procInfo.status !== 'running') {
        logger.error(`process ${procInfo.name} : ${procInfo.pid} is not in running status`)
        return false;
    }

    let process = processRegistry.getNewProcess(procInfo.name);

    if (!process) {
        logger.error(`failed to create process ${procInfo.name} : ${procInfo.pid}`);
        return false;
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
    if (this.processTable[pid]) {
        this.processTable[pid].status = 'killed';
    }

    for (var opid in this.processTable) {
        if (this.processTable[opid].parentPID === pid &&
            this.processTable[opid].stats !== 'killed') {
            this.killProcess(opid)
        }
    }
};

Kernel.prototype.getProcessByPid = function(pid) {
    return this.processTable[pid] && (this.processCache[pid] || this.createProcess(pid));
};

var getPID = function() {
    return 'P_' + Math.random().toString(32).slice(2) + Game.time.toString(32);
};

module.exports = Kernel;
