/*
 * Library for containers
 */

var libContainers = {

    getIdsContainersIn: function() {
        this.memory.containersIn = this.memory.containersIn || [];

        if (this.memory.containersIn.length === 0 ||
            (this.memory.sleepIdsContainersIn && this.memory.sleepIdsContainersIn > Game.time)
        ) {
            let room = Game.rooms[this.memory.workRoom];
            if (!room) return;

            let containers = room.getContainers();
            containers = _.filter(containers, c =>
                c.memory.type = 'in'
            );

            for (let i = 0; i < containers.length; i++) {
                this.memory.containersIn.push(containers[i].id);
            }

            this.memory.sleepIdsContainersIn = Game.time + (C.DIRECTOR_SLEEP * 10);
        };

        return this.memory.containersIn;
    },

};

module.exports = libContainers;
