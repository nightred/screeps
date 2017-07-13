/*
 * manage system
 *
 * handles loading and running of the manage modules
 *
 */

var manageRole      = require('manage.role');
var manageTask      = require('manage.task');
var manageRoom      = require('manage.room');
var manageCreep     = require('manage.creep');
var manageFlags     = require('manage.flags');

var Manage = function() {
    this.role   = new manageRole;
    this.task   = new manageTask;
    this.room   = new manageRoom;
    this.creep  = new manageCreep;
    this.flags  = new manageFlags;
};

Manage.prototype.run = function() {
    this.room.doManage();
    this.flags.doManage();
    this.creep.doManage();
    this.task.doManage();
};

module.exports = Manage;
