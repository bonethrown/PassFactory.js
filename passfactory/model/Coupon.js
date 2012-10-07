define(['model/Pass',
        'model/PassStyle'],

function(Pass, PassStyle) {

    "use strict";

    function Coupon(args) {
        Pass.call(this, args);
    }

    Coupon.prototype = Object.create(new Pass());

    Object.defineProperties(Coupon.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.Coupon; }
        }
    });

    Object.freeze(Coupon.prototype);

    return Coupon;
});
