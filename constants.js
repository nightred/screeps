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
    SIM: true,
    ACTIVE: true,
    
    ENERGY_ROOM_LIMIT: 600,
    ENERGY_CREEP_SPAWN_MAX: 800,
    ENERGY_TOWER_MIN: 500,
    ENERGY_CONTAINER_MAX_PERCENT: 0.9,
    ENERGY_CONTAINER_MIN_PERCENT: 0.1 ,
    ENERGY_CONTAINER_MIN_WITHDRAW: 100,
    ENERGY_STORAGE_MIN_WITHDRAW: 100,
    
    CONTROLLER_WITHDRAW_LEVEL: 2,
    
    RAMPART_HIT_MAX: 10000,
    
    LIMIT_BUILDERS: 1,
    LIMIT_UPGRADERS: 2,
    LIMIT_HARVESTERS: 2,
    LIMIT_REPAIRERS: 0,
    LIMIT_HAULERS: 2,
    LIMIT_SERVICE: 1,
    
    CREEP_LIVE_MIN: 40,

    HARVESTERS_CARRY: true,
    
};

/*
 * Set variables for SIM mode
 *
 */
Constants.LIMIT_SERVICE     = !Constants.SIM ? Constants.LIMIT_SERVICE      : 0;
Constants.LIMIT_BUILDERS    = !Constants.SIM ? Constants.LIMIT_BUILDERS     : 0;
Constants.LIMIT_UPGRADERS   = !Constants.SIM ? Constants.LIMIT_UPGRADERS    : 1;
Constants.LIMIT_HARVESTERS  = !Constants.SIM ? Constants.LIMIT_HARVESTERS   : 2;
Constants.LIMIT_REPAIRERS   = !Constants.SIM ? Constants.LIMIT_REPAIRERS    : 0;
Constants.LIMIT_HAULERS     = !Constants.SIM ? Constants.LIMIT_HAULERS      : 1;

module.exports = Constants;