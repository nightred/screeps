/*
 * Load processes to for execution
 */

// loader
require('processes.loader');

// services
require('processes.services.flag');
require('processes.services.room');
require('processes.services.creep');

// managers
require('processes.managers.room');
require('processes.managers.spawn');
require('processes.managers.squad');

// tasks
require('processes.tasks.dismantle');
require('processes.tasks.fieldtech');
require('processes.tasks.haul');
require('processes.tasks.militia');
require('processes.tasks.reserve');
require('processes.tasks.resupply');
require('processes.tasks.source');
require('processes.tasks.stock');
require('processes.tasks.tech');
require('processes.tasks.upgrade');
require('processes.tasks.mil.combat');

// directors
require('processes.directors.fieldtech');
require('processes.directors.mining');
require('processes.directors.remote');
require('processes.directors.room');
require('processes.directors.tech');
