/*
 * Logger Functions.
 *
 */

const styles = {
    default:            "color: white; background-color: black;",
    [C.LOGLEVEL.INFO]:  "color: green",
    [C.LOGLEVEL.DEBUG]: "color: blue",
    [C.LOGLEVEL.SILLY]: "color: darkblue",
    [C.LOGLEVEL.ALERT]: "color: cyan",
    [C.LOGLEVEL.WARN]:  "color: white",
    [C.LOGLEVEL.ERROR]: "color: red",
    [C.LOGLEVEL.FATAL]: "color: yellow, background-color: red",
};

const logLevelName = {
    0:      'DEBUG',
    1:      'INFO',
    2:      'ALERT',
    3:      'WARN',
    4:      'ERROR',
    5:      'FATAL',
};

var Logger = function(prefix) {
    prefix = prefix || "";

    this.prefix = prefix;
    this.level = C.DEFAULT_LOGLEVEL;
};

//room, cmd, result, cpu, output,

Logger.prototype.log = function(level, message) {
    if (level >= this.level) {
        if (typeof message == "function") {
            message = message();
        }

        let style = styles[level] || styles.default;

        let logLevel = logLevelName[level];

        console.log(`<log severity="${logLevel}" style="${style}">[${logLevel}] ${this.prefix} ${message}</log>`);
    }
};

Logger.prototype.debug = function(message) {
    this.log(C.LOGLEVEL.DEBUG, message);
};

Logger.prototype.info = function(message) {
    this.log(C.LOGLEVEL.INFO, message);
};

Logger.prototype.alert = function(message) {
    this.log(C.LOGLEVEL.ALERT, message);
};

Logger.prototype.warn = function(message) {
    this.log(C.LOGLEVEL.WARN, message);
};

Logger.prototype.error = function(message) {
    this.log(C.LOGLEVEL.ERROR, message);
};

Logger.prototype.fatal = function(message) {
    this.log(C.LOGLEVEL.FATAL, message);
};

module.exports = Logger;
