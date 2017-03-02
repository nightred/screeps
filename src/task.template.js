/*
 * task Template
 *
 * template task is a blank template of task module
 *
 */

var taskTemplate = {

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

module.exports = taskTemplate;
