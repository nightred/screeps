/*
 * manage system
 *
 * handles loading and running of the manage modules
 *
 */

var manageRole      = require('manage.role');
var manageRoom      = require('manage.room');
var manageCreep     = require('manage.creep');
var manageFlags     = require('manage.flags');

var Manage = function() {
    this.role   = new manageRole;
    this.room   = new manageRoom;
    this.creep  = new manageCreep;
    this.flags  = new manageFlags;
};

Manage.prototype.run = function() {
    this.room.doManage();
    this.flags.run();
    this.creep.doManage();
};

module.exports = Manage;
