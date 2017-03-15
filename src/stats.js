/*
 * Stats systems
 *
 */

var Stats = {

    init: function() {
        Memory.stats = Memory.stats || {};
        this.memory = Memory.stats;
        this.memory.cpugraphdata = this.memory.cpugraphdata || [];
    },

    logCPU: function() {
        this.memory.cpugraphdata.push(Game.cpu.getUsed());
        if ( this.memory.cpugraphdata.length > 100 ) this.memory.cpugraphdata.shift();
    },

    visuals: function() {
        if (!Constant.VISUALS) { return true; }

        this.graphCPU();
        this.reportWork();
    },

    reportWork: function() {
        let size = {t: 2, l: 2, };
        let fontSize = 0.5;
        let textStyle = {
            align: 'left',
            color: '#BBBBBB',
            font: fontSize,
            opacity: 0.8,
            background: '#222222',
            stroke : '#222222',
            strokeWidth : 0.15,
    	};

        let output = 'Work Report\n';

        output += Game.Queues.getReport();

        let rv = new RoomVisual();
        let lines = output.split('\n');
        for (let l = 0; l < lines.length; l++) {
            rv.text(lines[l], 1, 1 + (l * (0.5 + 0.1)), textStyle);
        }
    },

    graphCPU: function() {
        let cpuMax = Math.floor(Math.max.apply(null, this.memory.cpugraphdata) + 2);
        let cpuMin = Math.floor(Math.min.apply(null, this.memory.cpugraphdata) - 2);
        cpuMin = cpuMin < 0 ? 0 : cpuMin;
        let step = Math.floor((cpuMax - cpuMin) / 4);
        let size = {w: 22, h: 4, t: 44, l: 2, };
        let rv = new RoomVisual();

        rv.rect(size.l - 0.1, size.t - 0.1, size.w + 0.2, size.h + 0.2, { fill: 'transparent', stroke: '#8a8a8a', opacity: 0.3, });
        rv.line(size.l, size.t + (size.h * 0.25), size.l + size.w, size.t + (size.h * 0.25), { color: '#8a8a8a', opacity: 0.3, lineStyle: 'dashed', });
        rv.line(size.l, size.t + (size.h * 0.50), size.l + size.w, size.t + (size.h * 0.50), { color: '#8a8a8a', opacity: 0.3, lineStyle: 'dashed', });
        rv.line(size.l, size.t + (size.h * 0.75), size.l + size.w, size.t + (size.h * 0.75), { color: '#8a8a8a', opacity: 0.3, lineStyle: 'dashed', });
        rv.text("CPU Used Graph - Bucket " + Game.cpu.bucket, size.l, size.t - 0.5, {color: "#BBBBBB", align: "left", size: 0.45, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(cpuMax, size.l - 0.3, size.t + 0.2, {color: this.getCpuGraphColor(cpuMax), align: "right", size: 0.45, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(cpuMin + (step * 3), size.l - 0.3, size.t + (size.h - (size.h * 0.75)) + 0.2, {color: this.getCpuGraphColor(cpuMin + (step * 3)), align: "right", size: 0.45, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(cpuMin + (step * 2), size.l - 0.3,  size.t + (size.h - (size.h * 0.5)) + 0.2, {color: this.getCpuGraphColor(cpuMin + (step * 2)), align: "right", size: 0.45, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(cpuMin + (step * 1), size.l - 0.3,  size.t + (size.h - (size.h * 0.25)) + 0.2, {color: this.getCpuGraphColor(cpuMin + (step * 1)), align: "right", size: 0.45, stroke : '#222222', strokeWidth : 0.15, background: "222222" });
        rv.text(cpuMin, size.l - 0.3,  size.t + size.h + 0.2, {color: this.getCpuGraphColor(cpuMin), align: "right", size: 0.45, stroke : '#222222', strokeWidth : 0.15, background: "222222" });

        for ( let i = 0; i < this.memory.cpugraphdata.length; i ++ ) {
            let cpuUsed = this.memory.cpugraphdata[i];
            let cpuUsedLast = this.memory.cpugraphdata[i-1];

            if ( i > 0 ) {
                rv.line( size.l + ((size.w / 99) * i),
                    size.t + ((size.h / (cpuMax - cpuMin)) * (cpuMax - cpuUsed)),
                    size.l + ((size.w / 99) * (i - 1)),
                    size.t + ((size.h / (cpuMax - cpuMin)) * (cpuMax - cpuUsedLast)),
                    { color: '#9c9c9c' });
            }
            rv.circle( size.l + ((size.w / 99) * i),
                size.t + ((size.h / (cpuMax - cpuMin)) * (cpuMax - cpuUsed)),
                { radius: 0.1, fill: this.getCpuGraphColor(cpuUsed), opacity : 0.5 });
        }
    },

    getCpuGraphColor: function(num) {
        let col = "#7fff00"
        col = num > (Game.cpu.limit * 0.4) ? '#6a6aff' : col;
        col = num > (Game.cpu.limit * 0.7) ? '#ffff00' : col;
        col = num > (Game.cpu.limit * 0.9) ? '#ff7f00' : col;
        col = num > (Game.cpu.limit * 0.98) ? '#ff0000' : col;

        return col;
    },

};

module.exports = Stats
