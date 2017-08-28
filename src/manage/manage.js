/*
 * manage system
 *
 * handles loading and running of the manage modules
 *
 */

var manageCreep     = require('manage.creep');

var Manage = function() {
    this.creep  = new manageCreep;
};

Manage.prototype.run = function() {
    this.creep.run();
};

module.exports = Manage;
