/*
 * Profiling
 *
 */

module.exports = {

    track: function(callback, name) {
        name = name || 'undefined';

        let startCPUUsed = Game.cpu.getUsed();

        let returnVal = callback();

        let endCPUUsed = Game.cpu.getUsed();

        let profileTime = endCPUUsed - startCPUUsed;

        console.log('PROFILE - ' + name + ' used:' + profileTime + ' start: ' + startCPUUsed + ' end: ' + endCPUUsed)

        return returnVal;
    },

};
