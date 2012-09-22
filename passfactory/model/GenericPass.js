define(['model/Pass', 'model/PassType'], function(Pass, PassType) {
    function GenericPass(args) {
        Pass.call(this, args);
    }

    GenericPass.prototype = Object.create(new Pass());

    Object.defineProperties(GenericPass.prototype, {
        passTypeIdentifier: {
            configurable: false,
            get: function() { return PassType.Generic; }
        }
    });

    Object.freeze(GenericPass.prototype);

    return GenericPass;
});
