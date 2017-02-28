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

    // debug: 0 off, 1 info, 2 debug, 3 verbose
    DEBUG:                          3,

    ENERGY_ROOM_WITHDRAW_MIN:       200,
    ENERGY_CREEP_SPAWN_MIN:         200,
    ENERGY_TOWER_MIN:               300,
    ENERGY_CONTAINER_MAX_PERCENT:   0.9,
    ENERGY_CONTAINER_MIN_PERCENT:   0.1 ,
    ENERGY_CONTAINER_MIN_WITHDRAW:  100,
    ENERGY_STORAGE_MIN_WITHDRAW:    100,

    CONTROLLER_WITHDRAW_LEVEL:      2,

    WORK_FIND_WAIT:                 5,
    MANAGE_WAIT_TICKS:              5,
    REPORT_TICKS:                   500,

    REPAIR_HIT_WORK_MIN:            0.80,
    REPAIR_HIT_WORK_MAX:            0.95,
    RAMPART_HIT_MAX:                100000,
    WALL_HIT_MAX:                   100000,

    REFILL_TOWER_MAX:               0.90,
    REFILL_TOWER_MIN:               0.50,

    CREEP_DESPAWN_TICKS:            40,
    CREEP_IDLE_TIME:                10,

    HARVESTERS_PER_SOURCE:          1,

    QUEUE_WORK:                     'work',
    QUEUE_SPAWN:                    'spawn',

    ROLE_TYPES: [
        'harvester',
        'hauler',
        'service',
        'upgrader',
        'scout',
        'controller',
        'remote.harvester',
        ],

    WORK_TASKS: [
        'repair',
        'build',
        'tower.refill',
        'harvestEnergy',
        'haul',
        'upgrade',
        'service',
        'room.build',
        'signcontroller',
        'scout',
        'room.claim',
        'room.reserve',
        'remote.harvest',
        ],

    DIRECTIONS: {
        1: [0, -1],
        2: [1, -1],
        3: [1, 0],
        4: [1, 1],
        5: [0, 1],
        6: [-1, 1],
        7: [-1, 0],
        8: [-1, -1],
    },

};

module.exports = Constants;
