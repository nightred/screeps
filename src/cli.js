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

var Cli = {
    
    creep: {
        
        despawn: function(creepName) {
            if (!creepName) {
                console.log('ERROR - command need the following values: creepName');
                return false;
            }
            
            if (!Game.creeps[creepName]) {
                console.log('ERROR - ' + creepName + ' is not a valid creep');
                return false;
            }
            
            Game.creeps[creepName].memory.despawn = true;
            console.log('RESULT - ' + creepName + ' has been set to despawn');
            
            return true;
        }
        
    },
    
    report: {
        
        run: function() {
            let report = '╔═ REPORT - game tick: ' + Game.time + ' ';
            for (i = report.length; i < 70; i++) { report += "═" }
            report += '\n';
            report += Work.getReport();
            report += '╠══════════════════════════════════════════════════════════════════════\n';
            report += QSpawn.getReport();
            report += '╚══════════════════════════════════════════════════════════════════════';
            console.log(report);
        },
        
        test: function() {
            //let style = '<style> .report table { border:1px solid #ddd; } .report td { padding-right: 10px; padding-left: 10px; }</style>';
            //let table = '<table class="report"><tr><td class="report">hello</td><td class="report">second</td></tr><tr><td class="report">count</td><td class="report">note</td></tr></table>';
            //console.log(style + table)
            
            let report = '╔═ REPORT - game tick: ' + Game.time + ' ';
            for (i = report.length; i < 70; i++) { report += "═" }
            console.log(report)
        }
        
    },
    
    work: {
        
        remove: function(workId) {
            if (!workId) {
                console.log('ERROR - command need the following values: workId');
                return false;
            }
            
            return Work.removeWork(workId);
        },
        
        signcontroller: function(roomName, message) {
            if (!roomName || !message) {
                console.log('ERROR - command need the following values: roomName, message');
                return false;
            }
            
            return Work.addWork('signcontroller', roomName, 30, { message: message, });
        },
        
        harvestEnergy: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('harvestEnergy', roomName, 20, { managed: true, });
        },
        
        haul: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('haul', roomName, 22, { managed: true, });
        },
        
        upgrade: function(roomName, creepLimit) {
            if (!roomName || !creepLimit) {
                console.log('ERROR - command need the following values: roomName, creepLimit');
                return false;
            }
            
            return Work.addWork('upgrade', roomName, 26, { managed: true, creepLimit: creepLimit });
        },
        
        service: function(roomName, creepLimit) {
            if (!roomName || !creepLimit) {
                console.log('ERROR - command need the following values: roomName, creepLimit');
                return false;
            }
            
            return Work.addWork('service', roomName, 24, { managed: true, creepLimit: creepLimit });
        },
        
        roombuild: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('room.build', roomName, 10, { managed: true, });
        },
        
        scout: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('scout', roomName, 30);
        },
        
        reserve: function(roomName, spawnRoom) {
            if (!roomName || !spawnRoom) {
                console.log('ERROR - command need the following values: roomName, spawnRoom');
                return false;
            }
            let args = { 
                spawnRoom: spawnRoom, 
                managed: true,
                creepLimit: 2,
            };
            
            return Work.addWork('room.reserve', roomName, 10, args);
        },
        
        remoteharvest: function(roomName, spawnRoom) {
            if (!roomName || !spawnRoom) {
                console.log('ERROR - command need the following values: roomName, spawnRoom');
                return false;
            }
            let args = { 
                spawnRoom: spawnRoom, 
                managed: true,
            };
            
            return Work.addWork('remote.harvest', roomName, 40, args);
        },
        
    },
    
    spawn: {
        
        scout: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return QSpawn.addQueue(roomName, 'scout', 10);
        },
        
        hauler: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return QSpawn.addQueue(roomName, 'hauler', 10);
        },
        
        harvester: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return QSpawn.addQueue(roomName, 'harvester', 10);
        },
        
    },
    
}

module.exports = Cli;
