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
    
    ENERGY_ROOM_LIMIT: 600,
    ENERGY_CREEP_SPAWN_MAX: 800,
    CONTROLLER_WITHDRAW_LEVEL: 2,
    
    LIMIT_BUILDERS: 1,
    LIMIT_UPGRADERS: 2,
    LIMIT_HARVESTERS: 2,
    LIMIT_REPAIRERS: 0,
    LIMIT_HAULERS: 4,
    LIMIT_SERVICE: 1,

    HARVESTERS_CARRY: true,
    
    ROOM_HOME: () => Game.rooms['E86N9'],
    SPAWNER_MAIN: () => Game.getObjectById('589a328fd19040a10bed309e')
    
};

/*
 * Set variables for SIM mode
 *
 */
Constants.LIMIT_BUILDERS    = !Constants.SIM ? Constants.LIMIT_BUILDERS   : 1;
Constants.LIMIT_UPGRADERS   = !Constants.SIM ? Constants.LIMIT_UPGRADERS  : 1;
Constants.LIMIT_HARVESTERS  = !Constants.SIM ? Constants.LIMIT_HARVESTERS : 2;
Constants.LIMIT_REPAIRERS   = !Constants.SIM ? Constants.LIMIT_REPAIRERS  : 1;
Constants.LIMIT_HAULERS     = !Constants.SIM ? Constants.LIMIT_HAULERS    : 2;

module.exports = Constants;