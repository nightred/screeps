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

// debug = 0 off, 1 info, 2 debug, 3 verbose
Constant.DEBUG                          = 3;
Constant.SIM                            = false;
Constant.VISUALS                        = true;

Constant.ENERGY_ROOM_WITHDRAW_MIN       = 250;
Constant.ENERGY_CREEP_SPAWN_MIN         = 200;
Constant.ENERGY_TOWER_REPAIR_MIN        = 301;
Constant.ENERGY_STORAGE_MIN_FILL_TOWER  = 0.05;
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
Constant.TOWER_REPAIR_TICKS             = 5;
Constant.REPORT_TICKS                   = 500;
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

Constant.MINER                          = 'miner';
Constant.HARVESTER                      = 'harvester';
Constant.UPGRADER                       = 'upgrader';
Constant.TECH                           = 'tech';
Constant.CRASHTECH                      = 'crashtech';
Constant.HAULER                         = 'hauler';
Constant.RESUPPLY                       = 'resupply';
Constant.LINKER                         = 'linker';
Constant.STOCKER                        = 'stocker';
Constant.SCOUT                          = 'scout';
Constant.CONTROLLER                     = 'controller';
Constant.COMBAT_BRAWLER                 = 'combat.brawler';
Constant.COMBAT_SWARMER                 = 'combat.swarmer';
Constant.COMBAT_MEDIC                   = 'combat.medic';
Constant.COMBAT_MILITIA                 = 'combat.militia';

Constant.ROLE_TYPES = [
    Constant.MINER,
    Constant.UPGRADER,
    Constant.TECH,
    Constant.CRASHTECH,
    Constant.HAULER,
    Constant.RESUPPLY,
    Constant.LINKER,
    Constant.STOCKER,
    Constant.SCOUT,
    Constant.CONTROLLER,
    Constant.COMBAT_BRAWLER,
    Constant.COMBAT_SWARMER,
    Constant.COMBAT_MEDIC,
    Constant.COMBAT_MILITIA,
];

Constant.DIRECTOR_ROOM                  = 'room';
Constant.DIRECTOR_MINING                = 'mining';
Constant.DIRECTOR_SOURCE                = 'source';
Constant.DIRECTOR_RESUPPLY              = 'resupply';
Constant.DIRECTOR_CONTROLLER            = 'controller';
Constant.DIRECTOR_HAULING               = 'hauling';
Constant.DIRECTOR_INTERHAULING          = 'interhauling';
Constant.DIRECTOR_STOCKING              = 'stocking';
Constant.DIRECTOR_TECH                  = 'tech';
Constant.DIRECTOR_RESERVE               = 'reserve';

Constant.DIRECTOR_TYPES = [
    Constant.DIRECTOR_ROOM,
    Constant.DIRECTOR_MINING,
    Constant.DIRECTOR_SOURCE,
    Constant.DIRECTOR_RESUPPLY,
    Constant.DIRECTOR_CONTROLLER,
    Constant.DIRECTOR_HAULING,
    Constant.DIRECTOR_INTERHAULING,
    Constant.DIRECTOR_STOCKING,
    Constant.DIRECTOR_TECH,
    Constant.DIRECTOR_RESERVE,
];

Constant.DIRECTOR_FLAG_TYPES = [
    Constant.DIRECTOR_ROOM,
    Constant.DIRECTOR_MINING,
    Constant.DIRECTOR_INTERHAULING,
    Constant.DIRECTOR_TECH,
    Constant.DIRECTOR_RESERVE,
];

Constant.TASK_SOURCE                    = 'source';
Constant.TASK_RESUPPLY                  = 'resupply';
Constant.TASK_UPGRADE                   = 'upgrade';
Constant.TASK_HAUL                      = 'haul';
Constant.TASK_STOCK                     = 'stock';
Constant.TASK_TECH                      = 'tech';
Constant.TASK_RESERVE                   = 'reserve';

Constant.TASK_TYPES = [
    Constant.TASK_SOURCE,
    Constant.TASK_RESUPPLY,
    Constant.TASK_UPGRADE,
    Constant.TASK_HAUL,
    Constant.TASK_STOCK,
    Constant.TASK_TECH,
    Constant.TASK_RESERVE,
];

Constant.WORK_TOWER_REFILL              = 'tower.fill';
Constant.WORK_TERMINAL_EMPTY            = 'terminal.empty';
Constant.WORK_REPAIR                    = 'repair';
Constant.WORK_CONSTRUCTION              = 'construction';
Constant.WORK_SIGNCONTROLLER            = 'signcontroller';
Constant.WORK_SCOUTING                  = 'scouting';
Constant.WORK_DEFENSE                   = 'defense';
Constant.WORK_ATTACK                    = 'attack';
Constant.WORK_CLAIM                     = 'claim';

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
