define(['model/Pass', 'model/PassType'], function(Pass, PassType) {
    function StoreCard(args) {
        Pass.call(this, args);
    }

    StoreCard.prototype = Object.create(new Pass());

    Object.defineProperties(StoreCard.prototype, {
        passTypeIdentifier: {
            configurable: false,
            get: function() { return PassType.StoreCard; }
        }
    });

    Object.freeze(StoreCard.prototype);

    return StoreCard;
});
