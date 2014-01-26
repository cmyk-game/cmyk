var events = require("eventemitter2")
var underscore = require("underscore")

module.exports = function(game) {
    // maps "x|y|z" to EventEmitter for that place
    var eventEmitterCache = {};

    var positional = new events.EventEmitter2({
        maxListeners: 100,
    });

    // returns the event emitter for this position
    // pos == [x, y, z]
    function at(pos) {
        var posString = pos.join("|");
        if(!eventEmitterCache[posString]) {
            var em = new events.EventEmitter2();
            em.onAny(function (arg0, arg1, arg2) {
                // so if something did at([1,2,3]).emit("electricity", "#ff0000")
                // args := ["#ff0000"]
                // then args == [[1,2,3], ["#ff0000"]]
                // then args == ["electricity", [1,2,3], ["#ff0000"]]
                // then you call apply on positional.emit
                // which is the same as positional.emit("electricity", [1,2,3], ["#ff0000"])

                // var args = Array.prototype.slice.call(arguments);
                // args.unshift(pos);
                // args.unshift(this.event);
                // positional.emit.apply(positional.emit, args);

                // delegate at() emits to the generic positional emitter
                positional.emit(this.event, pos, arg0, arg1, arg2);
            });
        }
        eventEmitterCache[posString] = eventEmitterCache[posString] || em;
        return eventEmitterCache[posString];
    }

    game.at = at;
    game.eventEmitterCache = eventEmitterCache;

    game.positional = positional;
}
