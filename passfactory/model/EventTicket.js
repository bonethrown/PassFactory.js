define(['model/Pass',
        'model/PassStyle'],

function(Pass, PassStyle) {

    "use strict";

    function EventTicket(args) {
        Pass.call(this, args);
    }

    EventTicket.prototype = Object.create(new Pass());

    Object.defineProperties(EventTicket.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.EventTicket; }
        }
    });

    Object.freeze(EventTicket.prototype);

    return EventTicket;
});
