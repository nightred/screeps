/*
 * manage system
 *
 * handles loading and running of the manage modules
 *
 */

var manageRooms     = require('manage.rooms');
var manageCreep     = require('manage.creep');
var manageFlags     = require('manage.flags');

var Manage = function() {
    this.rooms  = new manageRooms;
    this.creep  = new manageCreep;
    this.flags  = new manageFlags;
};

Manage.prototype.run = function() {
    this.rooms.doManage();
    this.creep.doManage();
    this.flags.doManage();
};

module.exports = Manage;
