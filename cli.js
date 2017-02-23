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
        
        harvestEnergy: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('harvestEnergy', roomName, 20, {managed: true,});
        },
        
        haul: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('haul', roomName, 22, {managed: true,});
        },
        
        upgrade: function(roomName, creepLimit) {
            if (!roomName || !creepLimit) {
                console.log('ERROR - command need the following values: roomName, creepLimit');
                return false;
            }
            
            return Work.addWork('upgrade', roomName, 26, {managed: true, creepLimit: creepLimit});
        },
        
        service: function(roomName, creepLimit) {
            if (!roomName || !creepLimit) {
                console.log('ERROR - command need the following values: roomName, creepLimit');
                return false;
            }
            
            return Work.addWork('service', roomName, 24, {managed: true, creepLimit: creepLimit});
        },
        
        buildRoom: function(roomName) {
            if (!roomName) {
                console.log('ERROR - command need the following values: roomName');
                return false;
            }
            
            return Work.addWork('buildRoom', roomName, 10, {managed: true,});
        },
        
    },
    
}

module.exports = Cli;