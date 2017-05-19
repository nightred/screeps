/*
 * Adds memory functions
 *
 */

Object.defineProperty(StructureContainer.prototype, 'memory', {
    get: function() {
        if (_.isUndefined(this.room.memory.structureContainers)) {
            this.room.memory.structureContainers = {};
        }
        if (!_.isObject(this.room.memory.structureContainers)) {
            return undefined;
        }

        return this.room.memory.structureContainers[this.id] = this.room.memory.structureContainers[this.id] || {};
    },
    set: function(value) {
        if (_.isUndefined(this.room.memory.structureContainers)) {
            this.room.memory.structureContainers = {};
        }
        if (!_.isObject(this.room.memory.structureContainers)) {
            throw new Error('Unable to set structureContainers memory');
        }
        this.room.memory.structureContainers[this.id] = value
    }
})

Object.defineProperty(StructureTower.prototype, 'memory', {
    get: function() {
        if (_.isUndefined(this.room.memory.structureTowers)) {
            this.room.memory.structureTowers = {};
        }
        if (!_.isObject(this.room.memory.structureTowers)) {
            return undefined;
        }

        return this.room.memory.structureTowers[this.id] = this.room.memory.structureTowers[this.id] || {};
    },
    set: function(value) {
        if (_.isUndefined(this.room.memory.structureTowers)) {
            this.room.memory.structureTowers = {};
        }
        if (!_.isObject(this.room.memory.structureTowers)) {
            throw new Error('Unable to set structureTowers memory');
        }
        this.room.memory.structureTowers[this.id] = value
    }
})

Object.defineProperty(StructureLink.prototype, 'memory', {
    get: function() {
        if (_.isUndefined(this.room.memory.structureLinks)) {
            this.room.memory.structureLinks = {};
        }
        if (!_.isObject(this.room.memory.structureLinks)) {
            return undefined;
        }

        return this.room.memory.structureLinks[this.id] = this.room.memory.structureLinks[this.id] || {};
    },
    set: function(value) {
        if (_.isUndefined(this.room.memory.structureLinks)) {
            this.room.memory.structureLinks = {};
        }
        if (!_.isObject(this.room.memory.structureLinks)) {
            throw new Error('Unable to set structureLinks memory');
        }
        this.room.memory.structureLinks[this.id] = value
    }
})

Object.defineProperty(Source.prototype, 'memory', {
    get: function() {
        if (_.isUndefined(this.room.memory.sources)) {
            this.room.memory.sources = {};
        }
        if (!_.isObject(this.room.memory.sources)) {
            return undefined;
        }

        return this.room.memory.sources[this.id] = this.room.memory.sources[this.id] || {};
    },
    set: function(value) {
        if (_.isUndefined(this.room.memory.sources)) {
            this.room.memory.sources = {};
        }
        if (!_.isObject(this.room.memory.sources)) {
            throw new Error('Unable to set sources memory');
        }
        this.room.memory.sources[this.id] = value
    }
})

Object.defineProperty(Mineral.prototype, 'memory', {
    get: function() {
        if (_.isUndefined(this.room.memory.minerals)) {
            this.room.memory.minerals = {};
        }
        if (!_.isObject(this.room.memory.minerals)) {
            return undefined;
        }

        return this.room.memory.minerals[this.id] = this.room.memory.minerals[this.id] || {};
    },
    set: function(value) {
        if (_.isUndefined(this.room.memory.minerals)) {
            this.room.memory.minerals = {};
        }
        if (!_.isObject(this.room.memory.minerals)) {
            throw new Error('Unable to set minerals memory');
        }
        this.room.memory.minerals[this.id] = value
    }
})
