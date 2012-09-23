define(['model/Pass', 'model/PassType'], function(Pass, PassType) {
    function Coupon(args) {
        Pass.call(this, args);
    }

    Coupon.prototype = Object.create(new Pass());

    Object.defineProperties(Coupon.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassType.Coupon; }
        }
    });

    Object.freeze(Coupon.prototype);

    return Coupon;
});
