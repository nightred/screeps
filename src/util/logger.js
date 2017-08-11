/*
 * Logger Functions.
 *
 */

const styles = {
    default:            "color: white; background-color: black;",
    [C.LOGLEVEL.INFO]:  "color: darkgreen",
    [C.LOGLEVEL.DEBUG]: "color: darkblue",
    [C.LOGLEVEL.SILLY]: "color: darkblue",
    [C.LOGLEVEL.ALERT]: "color: cyan",
    [C.LOGLEVEL.WARN]:  "color: white",
    [C.LOGLEVEL.ERROR]: "color: red",
    [C.LOGLEVEL.FATAL]: "color: yellow, background-color: red",
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

        console.log(`<log severity="${level}" style="${style}">[${level}] ${this.prefix} ${message}</log>`);
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
