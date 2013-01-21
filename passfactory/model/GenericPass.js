define(['model/Pass',
        'model/PassStyle'],

function(Pass, PassStyle) {
    'use strict';

    function GenericPass(args) {
        Pass.call(this, args);
    }

    GenericPass.prototype = Object.create(new Pass());

    Object.defineProperties(GenericPass.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.Generic; }
        }
    });

    Object.freeze(GenericPass.prototype);

    return GenericPass;
});
