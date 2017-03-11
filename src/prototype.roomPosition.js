/*
 * Room Position common functions
 *
 * Provides common functions to all room position objects
 *
 */
 
 RoomPosition.prototype.fromDirection = function(direction) {
     return new RoomPosition(this.x+Constant.DIRECTIONS[direction][0], this.y+Constant.DIRECTIONS[direction][1], this.roomName);
 }
 