var Constants = {
    
    DEBUG: true,
    ACTIVE: true,
    
    ROOM_ENERGY_LIMIT: 300,
    CREEP_SPAWN_MAX_ENERGY: 500,
    
    LIMIT_BUILDERS: 1,
    LIMIT_UPGRADERS: 3,
    LIMIT_HARVESTERS: 2,
    LIMIT_REPAIRERS: 1,
    LIMIT_HAULERS: 2,
    
    HARVESTERS_CARRY: true,
    
    CONTAINERS_IN: [
        '589b75738fed1133af41021f',
        '589bc23e8ff7f01320575109'
        ],
    CONTAINERS_OUT: [
        '589bdb98ea3611f5271f1ed4',
        '589be7f8e10246ac2932a903'
        ],
    
    ROOM_HOME: () => Game.rooms['E86N9'],
    SPAWNER_MAIN: () => Game.getObjectById('589a328fd19040a10bed309e')
    
};

module.exports = Constants;