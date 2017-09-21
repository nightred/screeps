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
Constant.VERSION_QUEUE                  = 'v3.00'

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
Constant.ENERGY_LINK_STORAGE_MIN        = 0.38;
Constant.ENERGY_LINK_STORAGE_MAX        = 0.8;
Constant.ENERGY_STORAGE_MAX             = 0.6;
Constant.ENERGY_CONTAINER_MAX           = 0.9;
Constant.ENERGY_STORAGE_SECONDARY_MIN   = 0.14;

Constant.LINK_STORAGE_TRANSFER_MIN      = 0.34;
Constant.LINK_STORAGE_MAX_ENERGY        = 0.8;
Constant.LINK_STORAGE_MIN_ENERGY        = 0.38;
Constant.LINK_IN_MIN_ENERGY             = 0.1;
Constant.LINK_OUT_MAX_ENERGY            = 0.8;

Constant.TERMINAL_ENERGY_MAX            = 0.2;

Constant.CONTROLLER_WITHDRAW_LEVEL      = 2;
Constant.CONTROLLER_RESERVE_MAX         = 4000;
Constant.CONTROLLER_RESERVE_MIN         = 1000;

Constant.MANAGE_MEMORY_TICKS            = 20;
Constant.TOWER_REPAIR_TICKS             = 4;

Constant.DEFENSE_SLEEP                  = 8;
Constant.DEFENSE_COOLDOWN               = 80;
Constant.DEFENSE_LIMIT_INCREASE_DELAY   = 100;

Constant.SQUAD_SLEEP_SPAWN              = 8;
Constant.SQUAD_SLEEP_NEWCREEP           = 3;

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
Constant.CREEP_SPAWN_SLEEP              = 8;

Constant.CPU_MIN_BUCKET_MIL             = 2000;
Constant.CPU_MIN_BUCKET_SQUAD           = 4000;
Constant.CPU_MIN_BUCKET_FLAGS           = 1000;

Constant.QUEUE_WORK                     = 'work';
Constant.QUEUE_SPAWN                    = 'spawn';

Constant.MARKET_MAX_ENERGY              = 500000;
Constant.MARKET_MAX_RESOURCE            = 20000;
Constant.MARKET_MAX_BOOST               = 3000;
Constant.MARKET_STOCK_ENERGY            = 50000;
Constant.MARKET_STORAGE_ENERGY_MIN      = 40000;
Constant.MARKET_MAX_COST                = 2000;
Constant.MARKET_SURPLUS_SLEEP           = 100;

Constant.WORK_FIND_SLEEP                = 12;

Constant.DIRECTOR_SLEEP                 = 24;

Constant.CACHE_SLEEP                    = 100;
Constant.CACHE = {
    STRUCTURES:     'structures',
    MARKET:         'market',
};

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

Constant.DIRECTOR_FIELDTECH             = 'directors/fieldtech';
Constant.DIRECTOR_MINING                = 'directors/mining';
Constant.DIRECTOR_REMOTE                = 'directors/remote';
Constant.DIRECTOR_ROOM                  = 'directors/room';
Constant.DIRECTOR_TECH                  = 'directors/tech';

Constant.DIRECTOR_TYPES = [
    Constant.DIRECTOR_FIELDTECH,
    Constant.DIRECTOR_MINING,
    Constant.DIRECTOR_REMOTE,
    Constant.DIRECTOR_ROOM,
    Constant.DIRECTOR_TECH,
];

Constant.DIRECTOR_FLAG_MAP = {
    'room':         Constant.DIRECTOR_ROOM,
    'remote':       Constant.DIRECTOR_REMOTE,
    'fieldtech':    Constant.DIRECTOR_FIELDTECH,
    'reserve':      Constant.DIRECTOR_RESERVE,
};

Constant.TASK_SOURCE                    = 'tasks/source';
Constant.TASK_RESUPPLY                  = 'tasks/resupply';
Constant.TASK_UPGRADE                   = 'tasks/upgrade';
Constant.TASK_HAUL                      = 'tasks/haul';
Constant.TASK_STOCK                     = 'tasks/stock';
Constant.TASK_TECH                      = 'tasks/tech';
Constant.TASK_FIELDTECH                 = 'tasks/fieldtech';
Constant.TASK_SCOUT                     = 'tasks/scout';
Constant.TASK_RESERVE                   = 'tasks/reserve';
Constant.TASK_MINERAL                   = 'tasks/mineral';
Constant.TASK_MILITIA                   = 'tasks/militia';
Constant.TASK_DISMANTLE                 = 'tasks/dismantle';
Constant.TASK_MIL_COMBAT                = 'tasks/mil/combat';

Constant.TASK_TYPES = [
    Constant.TASK_SOURCE,
    Constant.TASK_RESUPPLY,
    Constant.TASK_UPGRADE,
    Constant.TASK_HAUL,
    Constant.TASK_STOCK,
    Constant.TASK_TECH,
    Constant.TASK_FIELDTECH,
    Constant.TASK_SCOUT,
    Constant.TASK_RESERVE,
    Constant.TASK_MINERAL,
    Constant.TASK_MILITIA,
    Constant.TASK_DISMANTLE,
    Constant.TASK_MIL_COMBAT,
];

Constant.WORK_TOWER_REFILL              = 'towerfill';
Constant.WORK_TERMINAL_EMPTY            = 'terminalempty';
Constant.WORK_REPAIR                    = 'repair';
Constant.WORK_CONSTRUCTION              = 'construction';
Constant.WORK_SIGNCONTROLLER            = 'signcontroller';
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

Constant.RESOURCES_MINERALS = [
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_KEANIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
    RESOURCE_GHODIUM,
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
