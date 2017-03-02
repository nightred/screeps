/*
 * task Director Mine
 *
 * director mine task handles the creation of mine tasks for the room
 * spawning of miner role creeps for mine tasks is controled here
 *
 */

var taskDirectorMine = {

    /**
    * @param {Creep} creep The creep object
    * @param {Task} task The work task passed from the work Queue
    **/
    doTask: function(creep, task) {
        // run creep task
    },

    /**
    * @param {Task} task The work task passed from the work Queue
    **/
    doTaskManaged: function(task) {
        // managed tasks
    },

    /**
    * @param {Room} room The room object
    **/
    doTaskFind: function(room) {
        // task creation for the room
    },

};

module.exports = taskDirectorMine;
