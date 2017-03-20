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
            this.room.memory.structureContainers = {};
        }
        if (!_.isObject(this.room.memory.sources)) {
            throw new Error('Unable to set sources memory');
        }
        this.room.memory.sources[this.id] = value
    }
})
