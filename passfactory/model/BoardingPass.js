define(['Utility',
        'model/Pass',
        'model/PassStyle',
        'model/TransitType'],

function(Utility, Pass, PassStyle, TransitType) {

    "use strict";

    function BoardingPass(args) {

        this._super = Pass;

        this._super.call(this, args);
        
        if (args) {
            if (args.transitType) this.transitType = args.transitType;
        }
    }

    BoardingPass.prototype = Object.create(new Pass(), {
        toJSON: { value: function() {

            if (!this.transitType) throw new Error('Pass is not ready to be serialized. Transit type is not defined.');

            var result = this._super.prototype.toJSON.apply(this, arguments);

            result.boardingPass.transitType = this.transitType;

            return result;
        }}
    });

    Object.defineProperties(BoardingPass.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassStyle.BoardingPass; }
        },

        transitType: {
            configurable: false,
            get: function() { return this._transitType; },
            set: function(val) {
                Utility.validateType(val, TransitType);
                this._transitType = val;
            }
        }
    });

    Object.freeze(BoardingPass.prototype);

    return BoardingPass;
});
