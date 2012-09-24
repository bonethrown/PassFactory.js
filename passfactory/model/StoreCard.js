define(['model/Pass', 'model/PassStyle'], function(Pass, PassStyle) {
    function StoreCard(args) {
        Pass.call(this, args);
    }

    StoreCard.prototype = Object.create(new Pass());

    Object.defineProperties(StoreCard.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.StoreCard; }
        }
    });

    Object.freeze(StoreCard.prototype);

    return StoreCard;
});
