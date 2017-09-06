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
require('processes.managers.tower');
require('processes.managers.link');
require('processes.managers.spawn');
require('processes.managers.defense');
require('processes.managers.squad');

// tasks
require('processes.tasks.dismantle');
require('processes.tasks.fieldtech');
require('processes.tasks.haul');
require('processes.tasks.militia');
//require('processes.tasks.mineral');
require('processes.tasks.reserve');
require('processes.tasks.resupply');
require('processes.tasks.source');
require('processes.tasks.stock');
require('processes.tasks.tech');
require('processes.tasks.upgrade');
require('processes.tasks.mil.combat');

// directors
//require('processes.directors.controller');
require('processes.directors.fieldtech');
//require('processes.directors.hauling');
//require('processes.directors.interhauling');
require('processes.directors.mining');
require('processes.directors.remote');
//require('processes.directors.reserve');
//require('processes.directors.resupply');
require('processes.directors.room');
require('processes.directors.source');
//require('processes.directors.stocking');
require('processes.directors.tech');
