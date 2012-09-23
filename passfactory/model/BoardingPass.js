define(['Utility', 'model/Pass', 'model/PassType', 'model/TransitType'], function(Utility, Pass, PassType, TransitType) {

    function BoardingPass(args) {
        Pass.call(this, args);
        
        if (args) {
            if (args.transitType) this.transitType = args.transitType;
        }
    }

    BoardingPass.prototype = Object.create(new Pass(), {
    
    });

    Object.defineProperties(BoardingPass.prototype, {
        styleKey: {
            configurable: false,
            get: function() { return PassType.BoardingPass; }
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
