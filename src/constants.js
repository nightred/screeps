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

// User
Constant.USERNAME                       = 'nightred';

// Versioning
Constant.VERSION_DIRECTOR               = 'v2.01'
Constant.VERSION_QUEUE                  = 'v2.02'

Constant.SIM                            = false;
Constant.VISUALS                        = true;

Constant.ENERGY_ROOM_WITHDRAW_MIN       = 250;
Constant.ENERGY_CREEP_SPAWN_MIN         = 200;
Constant.ENERGY_TOWER_REPAIR_MIN        = 301;
Constant.ENERGY_STORAGE_MIN_FILL_TOWER  = 0.02;
Constant.ENERGY_CONTAINER_MAX_PERCENT   = 0.9;
Constant.ENERGY_CONTAINER_MIN_PERCENT   = 0.1 ;
Constant.ENERGY_CONTAINER_MIN_WITHDRAW  = 100;
Constant.ENERGY_STORAGE_MIN_WITHDRAW    = 100;
Constant.ENERGY_LINK_IN_MIN             = 0.1;
Constant.ENERGY_LINK_OUT_MAX            = 0.8;
Constant.LINK_STORAGE_TRANSFER_MIN      = 0.34;
Constant.ENERGY_LINK_STORAGE_MIN        = 0.38;
Constant.ENERGY_LINK_STORAGE_MAX        = 0.8;
Constant.ENERGY_STORAGE_MAX             = 0.6;
Constant.ENERGY_CONTAINER_MAX           = 0.9;
Constant.ENERGY_STORAGE_SECONDARY_MIN   = 0.14;

Constant.TERMINAL_ENERGY_MAX            = 0.2;

Constant.CONTROLLER_WITHDRAW_LEVEL      = 2;
Constant.CONTROLLER_RESERVE_MAX         = 4000;
Constant.CONTROLLER_RESERVE_MIN         = 1000;

Constant.FIND_WAIT_TICKS                = 8;
Constant.MANAGE_WAIT_TICKS              = 10;
Constant.MANAGE_MEMORY_TICKS            = 20;
Constant.TOWER_REPAIR_TICKS             = 4;
Constant.REPORT_TICKS                   = 500;

Constant.DEFENSE_SLEEP                  = 8;
Constant.DEFENSE_COOLDOWN               = 80;
Constant.DEFENSE_LIMIT_INCREASE_DELAY   = 100;

Constant.MIL_SQUAD_SPAWN_COOLDOWN       = 8;
Constant.MIL_SQUAD_CREEP_COOLDOWN       = 6;

Constant.SPAWN_COST_DECAY               = 200;
Constant.SPAWN_QUEUE_DELAY              = 2;
Constant.SPAWN_ENERGY_MAX               = 0.8;

Constant.REPAIR_HIT_WORK_MIN            = 0.80;
Constant.REPAIR_HIT_WORK_MAX            = 0.98;
Constant.RAMPART_HIT_MAX                = 100000;
Constant.WALL_HIT_MAX                   = 100000;

Constant.REFILL_TOWER_MAX               = 0.92;
Constant.REFILL_TOWER_MIN               = 0.40;

Constant.CREEP_DESPAWN_TICKS            = 1;
Constant.CREEP_IDLE_TIME                = 4;
Constant.CREEP_STUCK_TICK               = 4;
Constant.CREEP_FILL_TICKS               = 6;
Constant.CREEP_TRAVEL_RANGE             = 4;

Constant.CPU_MIN_BUCKET_MIL             = 2000;
Constant.CPU_MIN_BUCKET_SQUAD           = 4000;
Constant.CPU_MIN_BUCKET_FLAGS           = 1000;

Constant.QUEUE_WORK                     = 'work';
Constant.QUEUE_SPAWN                    = 'spawn';
Constant.QUEUE_MIL                      = 'mil';

Constant.DB_DIRECTOR                    = 1;

Constant.WORK_FIND_SLEEP                = 12;

Constant.DIRECTOR_SLEEP                 = 12;

Constant.ROLE_MINER                     = 'miner';
Constant.ROLE_HARVESTER                 = 'harvester';
Constant.ROLE_UPGRADER                  = 'upgrader';
Constant.ROLE_TECH                      = 'tech';
Constant.ROLE_FIELDTECH                 = 'fieldtech';
Constant.ROLE_HAULER                    = 'hauler';
Constant.ROLE_RESUPPLY                  = 'resupply';
Constant.ROLE_STOCKER                   = 'stocker';
Constant.ROLE_SCOUT                     = 'scout';
Constant.ROLE_CONTROLLER                = 'controller';
Constant.ROLE_COMBAT_BRAWLER            = 'combatbrawler';
Constant.ROLE_COMBAT_SWARMER            = 'combatswarmer';
Constant.ROLE_COMBAT_MEDIC              = 'combatmedic';
Constant.ROLE_COMBAT_MILITIA            = 'combatmilitia';

Constant.ROLE_TYPES = [
    Constant.ROLE_MINER,
    Constant.ROLE_UPGRADER,
    Constant.ROLE_TECH,
    Constant.ROLE_FIELDTECH,
    Constant.ROLE_HAULER,
    Constant.ROLE_RESUPPLY,
    Constant.ROLE_STOCKER,
    Constant.ROLE_SCOUT,
    Constant.ROLE_CONTROLLER,
    Constant.ROLE_COMBAT_BRAWLER,
    Constant.ROLE_COMBAT_SWARMER,
    Constant.ROLE_COMBAT_MEDIC,
    Constant.ROLE_COMBAT_MILITIA,
];

Constant.DIRECTOR_ROOM                  = 'room';
Constant.DIRECTOR_REMOTE                = 'remote';
Constant.DIRECTOR_MINING                = 'mining';
Constant.DIRECTOR_SOURCE                = 'source';
Constant.DIRECTOR_RESUPPLY              = 'resupply';
Constant.DIRECTOR_CONTROLLER            = 'controller';
Constant.DIRECTOR_HAULING               = 'hauling';
Constant.DIRECTOR_INTERHAULING          = 'interhauling';
Constant.DIRECTOR_STOCKING              = 'stocking';
Constant.DIRECTOR_TECH                  = 'tech';
Constant.DIRECTOR_FIELDTECH             = 'fieldtech';
Constant.DIRECTOR_RESERVE               = 'reserve';

Constant.DIRECTOR_TYPES = [
    Constant.DIRECTOR_ROOM,
    Constant.DIRECTOR_REMOTE,
    Constant.DIRECTOR_MINING,
    Constant.DIRECTOR_SOURCE,
    Constant.DIRECTOR_RESUPPLY,
    Constant.DIRECTOR_CONTROLLER,
    Constant.DIRECTOR_HAULING,
    Constant.DIRECTOR_INTERHAULING,
    Constant.DIRECTOR_STOCKING,
    Constant.DIRECTOR_TECH,
    Constant.DIRECTOR_FIELDTECH,
    Constant.DIRECTOR_RESERVE,
];

Constant.DIRECTOR_FLAG_TYPES = [
    Constant.DIRECTOR_ROOM,
    Constant.DIRECTOR_REMOTE,
    Constant.DIRECTOR_FIELDTECH,
    Constant.DIRECTOR_RESERVE,
];

Constant.TASK_SOURCE                    = 'task/source';
Constant.TASK_RESUPPLY                  = 'task/resupply';
Constant.TASK_UPGRADE                   = 'task/upgrade';
Constant.TASK_HAUL                      = 'task/haul';
Constant.TASK_STOCK                     = 'task/stock';
Constant.TASK_TECH                      = 'task/tech';
Constant.TASK_FIELDTECH                 = 'task/fieldtech';
Constant.TASK_RESERVE                   = 'task/reserve';
Constant.TASK_MILITIA                   = 'task/militia';
Constant.TASK_DISMANTLE                 = 'task/dismantle';

Constant.TASK_TYPES = [
    Constant.TASK_SOURCE,
    Constant.TASK_RESUPPLY,
    Constant.TASK_UPGRADE,
    Constant.TASK_HAUL,
    Constant.TASK_STOCK,
    Constant.TASK_TECH,
    Constant.TASK_FIELDTECH,
    Constant.TASK_RESERVE,
    Constant.TASK_MILITIA,
    Constant.TASK_DISMANTLE,
];

Constant.WORK_TOWER_REFILL              = 'towerfill';
Constant.WORK_TERMINAL_EMPTY            = 'terminalempty';
Constant.WORK_REPAIR                    = 'repair';
Constant.WORK_CONSTRUCTION              = 'construction';
Constant.WORK_SIGNCONTROLLER            = 'signcontroller';
Constant.WORK_SCOUTING                  = 'scouting';
Constant.WORK_DEFENSE                   = 'defense';
Constant.WORK_ATTACK                    = 'attack';
Constant.WORK_CLAIM                     = 'claim';
Constant.WORK_DISMANTLE                 = 'dismantle';

Constant.WORK_TYPES = [
    Constant.WORK_TOWER_REFILL,
    Constant.WORK_TERMINAL_EMPTY,
    Constant.WORK_REPAIR,
    Constant.WORK_CONSTRUCTION,
    Constant.WORK_SIGNCONTROLLER,
    Constant.WORK_SCOUTING,
    Constant.WORK_DEFENSE,
    Constant.WORK_ATTACK,
    Constant.WORK_CLAIM,
    Constant.WORK_DISMANTLE,
];

Constant.WORK_FIND = [
    Constant.WORK_TOWER_REFILL,
    Constant.WORK_REPAIR,
    Constant.WORK_CONSTRUCTION,
];

Constant.WORK_FLAG_TYPES = [
    Constant.WORK_SIGNCONTROLLER,
    Constant.WORK_SCOUTING,
    Constant.WORK_CLAIM,
    Constant.WORK_DISMANTLE,
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

Constant.LOGLEVEL = {
    DEBUG:  0,
    INFO:   1,
    ALERT:  2,
    WARN:   3,
    ERROR:  4,
    FATAL:  5,
};
Constant.DEFAULT_LOGLEVEL = Constant.LOGLEVEL.INFO

module.exports = Constant;
