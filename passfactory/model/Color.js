define(['Utility'],

function(Utility) {
    'use strict';

    function Color(redOrHex, green, blue) {
        if (Utility.isCorrectType(redOrHex, String)) {

            // Hex value supplied
            this.parseHexColor(redOrHex);

        } else {

            // RGB values supplied
            this.red = redOrHex || 0;
            this.green = green || 0;
            this.blue = blue || 0;

        }
    }
    
    Color.prototype = {
        parseHexColor: function(hex) {
            // Strip hash if it's there
            if (hex.indexOf('#') === 0) {
                hex = hex.substring(1);
            }

            if (hex.length === 6) {

                // Standard 6-character hex color
                this.red = parseInt(hex.substring(0, 2), 16);
                this.green = parseInt(hex.substring(2, 4), 16);
                this.blue = parseInt(hex.substring(4), 16);

            } else if (hex.length === 3) {

                // Web-safe 3-character hex color
                var expandedRed = hex.substring(0, 1) + hex.substring(0, 1);
                var expandedGreen = hex.substring(1, 2) + hex.substring(1, 2);
                var expandedBlue = hex.substring(2) + hex.substring(2);

                this.red = parseInt(expandedRed, 16);
                this.green = parseInt(expandedGreen, 16);
                this.blue = parseInt(expandedBlue, 16);

            } else {
                // Not sure what sort of color this is supposed to be
                throw new TypeError('Invalid hex color supplied: ' + hex);
            }
        },

        toJSON: function() {
            return 'rgb(' + this.red + ', ' + this.green + ', ' + this.blue + ')';
        }
    };

    Object.defineProperties(Color.prototype, {
        red: {
            configurable: false,
            get: function() { return this._red || 0; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255)  {
                    throw new TypeError('Invalid RBG red color value: ' + val);
                }
                this._red = val;
            }
        },

        green: {
            configurable: false,
            get: function() { return this._green || 0; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) {
                    throw new TypeError('Invalid RBG green color value: ' + val);
                }
                this._green = val;
            }
        },

        blue: {
            configurable: false,
            get: function() { return this._blue || 0; },
            set: function(val) {
                Utility.validateType(val, Number);
                if (val < 0 || val > 255) {
                    throw new TypeError('Invalid RBG blue color value: ' + val);
                }
                this._blue = val;
            }
        }
    });

    Object.freeze(Color.prototype);

    return Color;
});
