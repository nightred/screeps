/*
 * manage Market systems
 *
 */

var logger = new Logger('[Market Service]');

var MarketService = function() {
    // init
};

Object.defineProperty(MarketService.prototype, 'marketData', {
    get: function() {
        Memory.world = Memory.world || {};
        Memory.world.market = Memory.world.market || {};
        return Memory.world.market;
    },
    set: function(value) {
        Memory.world = Memory.world || {};
        Memory.world.market = Memory.world.market || {};
        Memory.world.market = value;
    },
});

MarketService.prototype.run = function() {
    marketCache = this.getCache();

    let marketCount = 0;
    if (marketCache.rooms) {
        marketCount = marketCache.rooms.length;
        for (var i = 0; i < marketCount; i++) {
            let room = Game.rooms[marketCache.rooms[i]];
            if (!room) continue;
            this.doRoomSurplus(room);
            this.doSellSurplus(room);
        }
    }
};

MarketService.prototype.doRoomSurplus = function(room) {
    let storage = room.storage;
    let terminal = room.terminal;
    if (!storage || !terminal) return;

    if (!this.marketData[room.name]) this.marketData[room.name] = {};

    if (this.marketData[room.name].sleepSurplus &&
        this.marketData[room.name].sleepSurplus > Game.time
    ) return;

    if (!this.marketData[room.name].surplus)
        this.marketData[room.name].surplus = {};

    for (const resource in storage.store) {
        if (resource == RESOURCE_ENERGY) {
            let surplus = storage.store[RESOURCE_ENERGY] - C.MARKET_MAX_ENERGY;
            if (surplus > 0) {
                this.marketData[room.name].surplus[RESOURCE_ENERGY] = surplus;
            }
            continue;
        }

        if (C.RESOURCES_MINERALS.indexOf(resource) >= 0) {
            let surplus = storage.store[resource] - C.MARKET_MAX_RESOURCE;
            if (surplus > 0) {
                this.marketData[room.name].surplus[resource] = surplus;
            }
            continue;
        }
    }

    this.marketData[room.name].sleepSurplus = Game.time + C.MARKET_SURPLUS_SLEEP;
};

MarketService.prototype.doSellSurplus = function(room) {
    let terminal = room.terminal;
    if (!terminal) return;
    if (terminal.cooldown) return;

    let sellAmt = 0;
    let sellResource;
    for (const resource in terminal.store) {
        let amt = terminal.store[resource];
        if (amt < C.MARKET_MIN_SALE) continue;
        if (resource == RESOURCE_ENERGY) {
            if (amt < (C.MARKET_STOCK_ENERGY + 5000)) continue;
            amt -= C.MARKET_STOCK_ENERGY;
        } else if (C.RESOURCES_MINERALS.indexOf(resource) === -1) {
            continue;
        }
        if (amt > sellAmt) {
            sellAmt = amt;
            sellResource = resource;
        }
    }

    if (sellAmt <= 0) return;
    let orders = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: sellResource,
    });
    if (orders.length === 0) return;
    orders = _.sortBy(orders, order => order.price);
    logger.debug(room.toString() +
        ' trying to sell ' + sellAmt + ' ' + sellResource +
        ' got back ' + orders.length + ' orders'
    );

    let orderCount = orders.length;
    for (var i = (orderCount - 1); i >= 0; i--) {
        let orderAmt = orders[i].remainingAmount;
        if (orderAmt > sellAmt) orderAmt = sellAmt;
        if (orderAmt > C.MARKET_MAX_SALE) orderAmt = C.MARKET_MAX_SALE;
        if (orderAmt < C.MARKET_MIN_SALE) continue;
        let cost = Game.market.calcTransactionCost(orderAmt, room.name, orders[i].roomName);
        if (cost > C.MARKET_MAX_COST) continue;
        let rslt = Game.market.deal(orders[i].id, orderAmt, room.name);
        if (rslt === OK) {
            logger.info(room.toString() +
                ' sold ' + orderAmt + ' ' + sellResource +
                ' at ' + orders[i].price +
                ' to ' + orders[i].roomName +
                ' used ' + cost + 'e' +
                ' for ' + (orders[i].price * orderAmt) + 'c'
            );
            break;
        }
    }
};

MarketService.prototype.getCache = function() {
    var marketCache = mod.cache.getData(C.CACHE.MARKET);
    if (mod.cache.isOld(C.CACHE.MARKET)) {
        let startCPU = Game.cpu.getUsed();

        let markets = _.filter(Game.structures, s =>
            s.structureType == STRUCTURE_TERMINAL
        );
        marketCache.rooms = _.reduce(markets, (acc, s) => {
            acc.push(s.room.name);
            return acc;
        }, []);
        mod.cache.markFresh(C.CACHE.MARKET);

        logger.debug('rebuilding market cache' +
            ' cpu used: ' + (Game.cpu.getUsed() - startCPU)
        );
    }

    return marketCache;
};

registerProcess('services/market', MarketService);
