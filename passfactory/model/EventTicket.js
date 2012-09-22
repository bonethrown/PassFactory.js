define(['model/Pass', 'model/PassType'], function(Pass, PassType) {
    function EventTicket(args) {
        Pass.call(this, args);
    }

    EventTicket.prototype = Object.create(new Pass());

    Object.defineProperties(EventTicket.prototype, {
        passTypeIdentifier: {
            configurable: false,
            get: function() { return PassType.EventTicket; }
        }
    });

    Object.freeze(EventTicket.prototype);

    return EventTicket;
});
