/*
 * Stats systems
 *
 */

var Stats = {

    init: function() {
        if ( !Memory.cpugraphdata ) Memory.cpugraphdata = [];
    },

    logCPU: function() {
        Memory.cpugraphdata.push(Game.cpu.getUsed());
        if ( Memory.cpugraphdata.length > 100 ) Memory.cpugraphdata.shift();
    },

    visuals: function() {
        if (!Constant.VISUALS) { return true; }

        this.graphCPU();
    },

    graphCPU: function() {
        let rv = new RoomVisual();

        for ( let i = 0; i < Memory.cpugraphdata.length; i ++ ) {
            let cpuamount = Memory.cpugraphdata[i];
            let lastcpuamount = Memory.cpugraphdata[i-1];
            let nextcpuamount = Memory.cpugraphdata[i+1];

            let col = "#ffffff"
            if ( cpuamount < Game.cpu.limit / 2) {
                col = "#" + Math.floor(32 + 224 * (cpuamount / Game.cpu.limit) ).toString(16) + "ff00";
            } else if ( cpuamount < Game.cpu.limit ) {
                col = "#ff" + (Math.floor( ( cpuamount / (Game.cpu.limit / 2) - 1 ) * -224 + 256 )).toString(16) + "00";
            } else {
                col = "#ff0000";
            }

            if ( i > 0 ) {
                rv.line( 1 + 0.15 + i * 0.3, 5 - ((lastcpuamount+cpuamount) / Game.cpu.limit), 1 + i * 0.3 + 0.3, 5 - (cpuamount / Game.cpu.limit) * 4, { color: col });
            }

            if ( i < Memory.cpugraphdata.length - 1) {
                rv.line( 1 + 0.3 + i * 0.3, 5 - (cpuamount / Game.cpu.limit) * 4, 1 + i * 0.3 + 0.45, 5 - ((cpuamount+nextcpuamount) / Game.cpu.limit), { color: col });
            }

            rv.circle( 1 + i * 0.3 + 0.3, 5 - (cpuamount / Game.cpu.limit) * 4, { radius: 0.05, fill: col, opacity : 1 });
        }

        rv.text("CPU Used Graph", 1, 0, {color: "#dddddd", align: "left", size: 0.55, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(Game.cpu.limit * 1  , 1, 1, {color: "#ff0000", align: "right", size: 0.55, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(Game.cpu.limit * 0.75, 1, 2, {color: "#ff7f00", align: "right", size: 0.55, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(Game.cpu.limit * 0.5  , 1, 3, {color: "#ffff00", align: "right", size: 0.55, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(Game.cpu.limit * 0.25, 1, 4, {color: "#7fff00", align: "right", size: 0.55, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(0, 1, 5, {color: "#00ff00", align: "right", size: 0.55, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
    },

};

module.exports = Stats
