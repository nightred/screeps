/*
 * Set variables for managment
 *
 * ACTIVE: controls run loop
 * DEBUG: Report on values at runtime
 *
 * ENERGY_* values set upper and lower usage values
 *
 * LIMIT_* values max creep spawn per room
 *
 */

var Constants = {
    
    DEBUG: true,
    SIM: false,
    ACTIVE: true,
    
    ENERGY_ROOM_LIMIT: 200,
    ENERGY_CREEP_SPAWN_MAX: 800,
    ENERGY_TOWER_MIN: 500,
    ENERGY_CONTAINER_MAX_PERCENT: 0.9,
    ENERGY_CONTAINER_MIN_PERCENT: 0.1 ,
    ENERGY_CONTAINER_MIN_WITHDRAW: 100,
    ENERGY_STORAGE_MIN_WITHDRAW: 100,
    
    CONTROLLER_WITHDRAW_LEVEL: 2,
    
    WORK_FIND_WAIT: 5,
    WORK_REPORT_WAIT: 200,
    
    REPAIR_HIT_WORK_MIN: 0.80,
    REPAIR_HIT_WORK_MAX: 0.95,
    RAMPART_HIT_MAX: 10000,
    
    REFILL_TOWER_MAX: 0.90,
    REFILL_TOWER_MIN: 0.50,
    
    LIMIT_UPGRADERS: 3,
    LIMIT_HARVESTERS: 2,
    LIMIT_HAULERS: 2,
    LIMIT_SERVICE: 1,
    
    CREEP_DESPAWN_TICKS: 40,
    CREEP_IDLE_TIME: 10,

    HARVESTERS_PER_SOURCE: 1,
    
    WORK_TYPES: [
        'repair',
        'build',
        'refillTower',
        ],
    
};

/*
 * Set variables for SIM mode
 *
 */
 
Constants.ENERGY_ROOM_LIMIT = !Constants.SIM ? Constants.ENERGY_ROOM_LIMIT  : 200;
Constants.LIMIT_SERVICE     = !Constants.SIM ? Constants.LIMIT_SERVICE      : 1;
Constants.LIMIT_UPGRADERS   = !Constants.SIM ? Constants.LIMIT_UPGRADERS    : 0;
Constants.LIMIT_HARVESTERS  = !Constants.SIM ? Constants.LIMIT_HARVESTERS   : 2;
Constants.LIMIT_HAULERS     = !Constants.SIM ? Constants.LIMIT_HAULERS      : 2;

module.exports = Constants;
