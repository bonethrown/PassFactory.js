define('model/Color', ['Utility'], function(Utility) {

    function Color(red, green, blue) {
        this.red = red || 0;
        this.green = green || 0;
        this.blue = blue || 0;
    }
    
    Color.prototype = {
        toJSON: function() {
            return 'rgb(' + this.red + ', ' + this.green + ', ' + this.blue + ')';
        }
    };

    Object.defineProperties(Color.prototype, {
        red: {
            configurable: false,
            get: function() { return this._red; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) throw new TypeError('Invalid RBG color value: ' + val);
                this._red = val;
            }
        },

        green: {
            configurable: false,
            get: function() { return this._green; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) throw new TypeError('Invalid RBG color value: ' + val);
                this._green = val;
            }
        },

        blue: {
            configurable: false,
            get: function() { return this._blue; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) throw new TypeError('Invalid RBG color value: ' + val);
                this._blue = val;
            }
        }
    });

    Object.freeze(Color.prototype);

    return Color;
});
