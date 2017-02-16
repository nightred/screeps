/*
 * Job managment system
 *
 * creates a job queue for creeps to work
 *
 */

var jobs = Object.create(Object.prototype);

jobs.test = function() {
    console.log('test');
}

//Object.defineProperty(Game, 'jobs', jobs);