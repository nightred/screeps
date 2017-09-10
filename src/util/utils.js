/*
 * Utility Functions.
 *
 */

var logger = new Logger('[Utils]');
logger.level = C.LOGLEVEL.DEBUG;

require('util.visuals');
require('util.storage');
require('util.allies');

global.setLinkType = function(id, type) {
    if (!id) { return ERR_INVALID_ARGS; }
    if (!type) { return ERR_INVALID_ARGS; }

    let link = Game.getObjectById(id);
    if (!link) { return false; }

    link.memory.type = type;

    return true;
};

global.reset = function(accept = false) {
    if (!accept) {
        logger.info('reset failed, did not accept')
        return;
    }

    logger.info('resetting kernel, queue memory, suicide all creep')
    delete Memory.kernel;
    delete Memory.queue;

    _.forEach(Game.creeps, creep => creep.suicide());
};

global.ps = function(pid = 0) {
    if (!Memory.kernel.processTable) return;

    let psOutput = [];
	let levelMap = [];
    let indent = {
        hasNextSibling:         '+',
        isLastChild:            '`',
        ancestorHasNextSibling: '|',
        ancestorIsLastChild:    ' ',
    };

    (function traverse(tree, depth) {
    	tree.forEach(function(node, idx) {
        	node.indent = levelMap.map(function (ancestor) {
          	     return ancestor === indent.hasNextSibling ? indent.ancestorHasNextSibling : indent.ancestorIsLastChild;
            });

        	node.indent.push(levelMap[depth] = tree.length -1 > idx ? indent.hasNextSibling : indent.isLastChild);

            psOutput.push({
                indent: node.indent.join(''),
                pid: node.pid,
                name: node.name,
                status: node.status,
                cpuUsed: node.cpuUsed,
            });

            traverse(node.children, depth + 1);
            levelMap.pop();
        })
    })(processTableTree(), 0);

    longestIndent = (_.max(psOutput, item => item.indent.length)).indent.length;

    longestName = (_.max(psOutput, item => item.name.length)).name.length + 2;

    let output = 'Process List:\n';
    output += _.padRight('', longestIndent + 1);
    output += _.padRight('PID', 19);
    output += _.padRight('NAME', longestName);
    output += _.padLeft('STATUS', 10);
    output += _.padLeft('CPU', 7);
    output +='\n';

    psOutput.forEach(item => {
        output += _.padRight(item.indent, longestIndent, '-') + ' ';
        output += _.padRight(item.pid, 19);
        output += _.padRight(item.name, longestName);
        output += _.padLeft(item.status, 10);
        output += _.padLeft(item.cpuUsed.toFixed(2), 7);
        output +='\n';
    });

    return output;
};

var processTableTree = function() {
    let processTable = Memory.kernel.processTable;
    let tree = [];
    let children = {};

    for (let name in processTable) {
        let item = processTable[name];
        let pid = item.pid;
        let parentPID = item.parentPID;

        children[pid] = children[pid] || [];

        item.children = children[pid];

        if (parentPID != 0) {
            children[parentPID] = children[parentPID] || [];
            children[parentPID].push(item)
        } else {
            tree.push(item);
        }
    }

    return tree;
};

String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

String.prototype.paddingRight = function (paddingValue) {
   return String(this + paddingValue).slice(0, paddingValue.length);
};
