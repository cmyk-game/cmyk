var events = require("events")

module.exports = function(game) {
    // maps "x|y|z" to EventEmitter for that place
    var eventEmitterCache = {};

    // returns the event emitter for this position
    // pos == [x, y, z]
    function at(pos) {
        var posString = pos.join("|");
        eventEmitterCache[posString] = eventEmitterCache[posString] || new events.EventEmitter()
        return eventEmitterCache[posString];
    }

    game.at = at;
    game.eventEmitterCache = eventEmitterCache;
}
