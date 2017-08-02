/*
 * Logger Functions.
 *
 */

var Logger = function() {
    this.logGlobal = [];
    this.logRooms = {};
};

//room, cmd, result, cpu, output,

Logger.prototype.log = function(args, completed) {
    let log = undefined;

    if (args.room) {
        if (!this.logRooms[args.room]) {
            this.logRooms[args.room] = [];
        }

        log = 
    }
}

module.exports = Logger;
