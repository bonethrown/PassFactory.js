define(['../util/PassUtility', './BarcodeFormat'],
       function(PassUtility, BarcodeFormat) {

    function Barcode(args) {
        this.altText = args.altText || null;
        this.format = args.format || null;
        this.message = args.message || null;
        this.messageEncoding = args.messageEncoding || null;
    }
    
    Barcode.prototype = {
        toJSON: function() {
            var notReadyMessage = 'Barcode not ready to be serialized. Property missing: ';
            var throwNotReadyError = function(p) { throw new Error(notReadyMessage + p); };

            if (!this.format) throwNotReadyError('format');
            if (!this.message) throwNotReadyError('message');
            if (!this.messageEncoding) throwNotReadyError('messageEncoding');

            var result = {
                format: this.format,
                message: this.message,
                messageEncoding: this.messageEncoding
            };

            if (this.altText) result.altText = this.altText;

            return result;
        }
    };

    Object.defineProperties(Barcode.prototype, {
        altText: {
            configurable: false,
            get: function() { return this._altText; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, String);
                this._altText = val;
            }
        },

        format: {
            configurable: false,
            get: function() { return this._format; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, BarcodeFormat);
                this._format = val;
            }
        },

        message: {
            configurable: false,
            get: function() { return this._message; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, String);
                this._message = message;
            }
        },

        messageEncoding: {
            configurable: false,
            get: function() { return this._messageEncoding; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, String);
                this._messageEncoding = val;
            }
        }
    });

    Object.freeze(Barcode.prototype);

    return Barcode;
});
