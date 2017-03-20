/*
 * manage system
 *
 * handles loading and running of the manage modules
 *
 */

var manageRooms     = require('manage.rooms');
var manageCreep     = require('manage.creep');

var Manage = function() {
    this.rooms  = new manageRooms;
    this.creep  = new manageCreep;
};

Manage.prototype.run = function() {
    this.rooms.doManage();
    this.creep.doManage();
};

module.exports = Manage;
