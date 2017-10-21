/*
 * Utility Functions.
 *
 */

var logger = new Logger('[Utils]');

require('util.visuals');
require('util.storage');
require('util.allies');

global.ex = function(img, args = {}) {
    if (!img) return 'unknown process';
    return Game.kernel.startProcess(undefined, img, args);
};

global.setLinkType = function(id, type) {
    if (!id) { return ERR_INVALID_ARGS; }
    if (!type) { return ERR_INVALID_ARGS; }

    let link = Game.getObjectById(id);
    if (!link) { return false; }

    link.memory.type = type;

    return true;
};

global.setPidStatus = function(pid, status = 'running') {
    if (!Memory.kernel.processTable[pid]) return;
    Memory.kernel.processTable[pid].status = 'running';
    Memory.kernel.processTable[pid].error = undefined;
};

global.restartCrashed = function(report = false) {
    let psOutput = _.filter(Memory.kernel.processTable, procInfo =>
        procInfo.status == 'crashed'
    );

    for (const i in psOutput) {
        setPidStatus(psOutput[i].pid, 'running');
        if (report) crashReport(psOutput[i].pid);
    }

    printProcessTable(psOutput, Object.keys(psOutput).length);
};

global.crashReport = function(pid) {
    let output = 'Crash report for pid: ' + pid;
    if (Memory.kernel.processTable[pid])
        output += '\n' +Memory.kernel.processTable[pid].error;
    logger.info(output);
};

global.resetKernel = function(accept = false) {
    if (!accept) {
        logger.info('reset missing validation, exiting')
        return;
    }

    logger.info('resetting kernel processes and memory');
    delete Memory.kernel;

    logger.info('clearing queue of all records');
    delete Memory.queue;

    logger.info('suiciding all creeps');
    _.forEach(Game.creeps, creep => creep.suicide());

    logger.info('clearing all room memory');
    Memory.rooms = {};
};

global.psTop = function(count, status) {
    if (!Memory.kernel.processTable) return;

    if (isNaN(count)) {
        if (count !== undefined) status = count;
        count = 10;
    }

    let psOutput = JSON.parse(JSON.stringify(Memory.kernel.processTable));

    if (status) {
        psOutput = _.filter(psOutput, procInfo =>
            procInfo.status == status
        );
    }

    printProcessTable(psOutput, count)
};

global.ps = function(pid = 0) {
    if (!Memory.kernel.processTable) return;

    let psOutput = [];
	let levelMap = [];
    let indent = {
        hasNextSibling:         '├',
        isLastChild:            '└',
        hasChild:               '┬',
        ancestorHasNextSibling: '│',
        ancestorIsLastChild:    ' ',
    };

    (function traverse(tree, depth) {
    	tree.forEach(function(node, idx) {
        	node.indent = levelMap.map(function (ancestor) {
          	     return ancestor === indent.hasNextSibling ? indent.ancestorHasNextSibling : indent.ancestorIsLastChild;
            });

        	node.indent.push(levelMap[depth] = tree.length -1 > idx ? indent.hasNextSibling : indent.isLastChild);
            if (node.children.length > 0) node.indent.push(indent.hasChild);

            psOutput.push({
                indent: node.indent.join(''),
                pid: node.pid,
                name: node.name,
                status: node.status,
                cpuUsed: node.cpuUsed,
                priority: node.priority,
            });

            traverse(node.children, depth + 1);
            levelMap.pop();
        })
    })(processTableTree(), 0);

    longestIndent = (_.max(psOutput, item => item.indent.length)).indent.length;

    longestName = (_.max(psOutput, item => item.name.length)).name.length + 2;

    let output = 'Process List:\n';
    output += _.padRight('', longestIndent, ' ') + ' ';
    output += _.padRight('PID', 19);
    output += _.padRight('NAME', longestName);
    output += _.padLeft('PRI', 4);
    output += _.padLeft('STATUS', 10);
    output += _.padLeft('CPU', 7);
    output +='\n';

    psOutput.forEach(item => {
        output += _.padRight(item.indent, longestIndent, '─') + ' ';
        output += _.padRight(item.pid, 19);
        output += _.padRight(item.name, longestName);
        output += _.padLeft(item.priority, 4);
        output += _.padLeft(item.status, 10);
        output += _.padLeft(item.cpuUsed.toFixed(2), 7);
        output +='\n';
    });

    logger.info(output)
};

var processTableTree = function() {
    let processTable = JSON.parse(JSON.stringify(Memory.kernel.processTable));
    let tree = [];
    let children = {};

    for (const name in processTable) {
        let item = processTable[name];
        let pid = item.pid;
        let parentPID = item.parentPID;

        children[pid] = children[pid] || [];

        item.children = children[pid];

        if (parentPID !== 0 && parentPID !== undefined ) {
            children[parentPID] = children[parentPID] || [];
            children[parentPID].push(item)
        } else {
            tree.push(item);
        }
    }

    return tree;
};

var printProcessTable = function(psOutput, count = 20) {
    let totalCount = Object.keys(psOutput).length;

    let longestName = 6;
    if (totalCount > 0) {
        longestName = (_.max(psOutput, item => item.name.length)).name.length + 2;
    }

    let output = 'Process List:\n';
    output += _.padRight('PID', 19);
    output += _.padRight('NAME', longestName);
    output += _.padLeft('PRI', 4);
    output += _.padLeft('STATUS', 10);
    output += _.padLeft('CPU', 7);
    output +='\n';

    if (totalCount > 0) {
        psOutput = _.sortBy(psOutput, procInfo =>
            procInfo.cpuUsed
        ).reverse();

        let loopCount = 0;
        for (const pid in psOutput) {
            let item = psOutput[pid];
            output += _.padRight(item.pid, 19);
            output += _.padRight(item.name, longestName);
            output += _.padLeft(item.priority, 4);
            output += _.padLeft(item.status, 10);
            output += _.padLeft(item.cpuUsed.toFixed(2), 7);
            output +='\n';

            loopCount++;
            if (loopCount >= count) break;
        }
    }

    logger.info(output)
};
