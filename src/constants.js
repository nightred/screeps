/*
 * Set variables for managment
 *
 * ACTIVE = controls run loop
 * DEBUG = Report on values at runtime
 *
 * ENERGY_* values set upper and lower usage values
 *
 * LIMIT_* values max creep spawn per room
 *
 */

var Constant = {};

// debug = 0 off, 1 info, 2 debug, 3 verbose
Constant.DEBUG                          = 2;
Constant.SIM                            = false;
Constant.VISUALS                        = true;

Constant.ENERGY_ROOM_WITHDRAW_MIN       = 250;
Constant.ENERGY_CREEP_SPAWN_MIN         = 200;
Constant.ENERGY_TOWER_MIN               = 300;
Constant.ENERGY_CONTAINER_MAX_PERCENT   = 0.9;
Constant.ENERGY_CONTAINER_MIN_PERCENT   = 0.1 ;
Constant.ENERGY_CONTAINER_MIN_WITHDRAW  = 100;
Constant.ENERGY_STORAGE_MIN_WITHDRAW    = 100;
Constant.ENERGY_LINK_IN_MIN             = 0.15;
Constant.ENERGY_LINK_OUT_MAX            = 0.8;
Constant.ENERGY_LINK_STORAGE_MIN        = 0.2;
Constant.ENERGY_LINK_STORAGE_MAX        = 0.8;

Constant.CONTROLLER_WITHDRAW_LEVEL      = 2;
Constant.CONTROLLER_RESERVE_MAX         = 4000;
Constant.CONTROLLER_RESERVE_MIN         = 1000;

Constant.FIND_WAIT_TICKS                = 8;
Constant.MANAGE_WAIT_TICKS              = 10;
Constant.REPORT_TICKS                   = 500;
Constant.DEFENSE_COOLDOWN               = 80;
Constant.DEFENSE_LIMIT_INCREASE_DELAY   = 100;

Constant.SPAWN_COST_DECAY               = 200;
Constant.SPAWN_QUEUE_DELAY              = 2;
Constant.SPAWN_ENERGY_MAX               = 0.8;

Constant.REPAIR_HIT_WORK_MIN            = 0.80;
Constant.REPAIR_HIT_WORK_MAX            = 0.98;
Constant.RAMPART_HIT_MAX                = 100000;
Constant.WALL_HIT_MAX                   = 100000;

Constant.REFILL_TOWER_MAX               = 0.98;
Constant.REFILL_TOWER_MIN               = 0.70;

Constant.CREEP_DESPAWN_TICKS            = 1;
Constant.CREEP_IDLE_TIME                = 4;
Constant.CREEP_STUCK_TICK               = 4;
Constant.CREEP_FILL_TICKS               = 6;

Constant.QUEUE_WORK                     = 'work';
Constant.QUEUE_SPAWN                    = 'spawn';

Constant.MINER                          = 'miner';
Constant.UPGRADER                       = 'upgrader';
Constant.TECH                           = 'tech';
Constant.HAULER                         = 'hauler';
Constant.RESUPPLY                       = 'resupply';
Constant.LINKER                         = 'linker';
Constant.SCOUT                          = 'scout';
Constant.CONTROLLER                     = 'controller';
Constant.COMBAT_BRAWLER                 = 'combat.brawler';
Constant.COMBAT_SWARMER                 = 'combat.swarmer';

Constant.ROLE_TYPES = [
    Constant.MINER,
    Constant.UPGRADER,
    Constant.TECH,
    Constant.HAULER,
    Constant.RESUPPLY,
    Constant.LINKER,
    Constant.SCOUT,
    Constant.CONTROLLER,
    Constant.COMBAT_BRAWLER,
    Constant.COMBAT_SWARMER,
    ];

Constant.DIRECTOR_ROOM                  = 'director.room';
Constant.DIRECTOR_REMOTE                = 'director.remote';
Constant.DIRECTOR_MINE                  = 'director.mine';
Constant.DIRECTOR_TECH                  = 'director.tech';
Constant.DIRECTOR_HAUL                  = 'director.haul';
Constant.DIRECTOR_LONGHAUL              = 'director.longhaul';
Constant.DIRECTOR_RESUPPLY              = 'director.resupply';
Constant.DIRECTOR_LINKER                = 'director.linker';
Constant.MINE                           = 'mine';
Constant.UPGRADE                        = 'upgrade';
Constant.RESERVE                        = 'reserve';
Constant.TOWER_REFILL                   = 'tower.fill';
Constant.REPAIR                         = 'repair';
Constant.CONSTRUCTION                   = 'construction';
Constant.SIGNCONTROLLER                 = 'signcontroller';
Constant.SCOUTING                       = 'scouting';
Constant.DEFENSE                        = 'defense';
Constant.ATTACK                         = 'attack';
Constant.CLAIM                          = 'claim';

Constant.WORK_TASKS = [
    Constant.DIRECTOR_ROOM,
    Constant.DIRECTOR_REMOTE,
    Constant.DIRECTOR_MINE,
    Constant.DIRECTOR_TECH,
    Constant.DIRECTOR_HAUL,
    Constant.DIRECTOR_LONGHAUL,
    Constant.DIRECTOR_LINKER,
    Constant.DIRECTOR_RESUPPLY,
    Constant.MINE,
    Constant.UPGRADE,
    Constant.RESERVE,
    Constant.TOWER_REFILL,
    Constant.REPAIR,
    Constant.CONSTRUCTION,
    Constant.SIGNCONTROLLER,
    Constant.SCOUTING,
    Constant.DEFENSE,
    Constant.ATTACK,
    Constant.CLAIM,
    ];

Constant.DIRECTIONS = {
    1: [0, -1],
    2: [1, -1],
    3: [1, 0],
    4: [1, 1],
    5: [0, 1],
    6: [-1, 1],
    7: [-1, 0],
    8: [-1, -1],
};

module.exports = Constant;
