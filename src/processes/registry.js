/*
 * Load processes to for execution
 */

// loader
require('processes.loader');

// services
require('processes.services.creep');
require('processes.services.flag');
require('processes.services.market');
require('processes.services.room');

// managers
require('processes.managers.market');
require('processes.managers.room');
require('processes.managers.spawn');
require('processes.managers.squad');

// tasks
require('processes.tasks.haul');
require('processes.tasks.mineral');
require('processes.tasks.militia');
require('processes.tasks.reserve');
require('processes.tasks.resupply');
require('processes.tasks.scout');
require('processes.tasks.source');
require('processes.tasks.stock');
require('processes.tasks.tech');
require('processes.tasks.upgrade');

// directors
require('processes.directors.mining');
require('processes.directors.remote');
require('processes.directors.room');
require('processes.directors.tech');

// jobs
require('processes.jobs.dismantle');
require('processes.jobs.fieldtech');
require('processes.jobs.mil.combat');
