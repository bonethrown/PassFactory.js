define(['../util/PassUtility', './TextAlignment'],
       function(PassUtility, TextAlignment) {

    function Field(args) {
        this._key = null;
        this._value = null;
        this._changeMessage = null;
        this._label = null;
        this._textAlignment = null;

        PassUtility.validateType(args, Object);

        this.key = args.key || null;
        this.value = args.value || null;
        this.changeMessage = args.changeMessage || null;
        this.label = args.label || null;
        this.textAlignment = args.textAlignment || null;
    }
    
    Field.prototype = {
        toJSON: function() {
            var message = 'Field not ready to be serialized. Missing property : ';

            if (!this.key) throw new Error(message + 'key');
            if (!this.value) throw new Error(message + 'value');

            var result = {
                key: this.key,
                value: this.value
            };

            if (this.changeMessage) result.value = this.changeMessage;
            if (this.label) result.label = this.label;
            if (this.textAlignment) result.textAlignment = this.textAlignment;

            return result;
        }
    };

    Object.defineProperties(Field.prototype, {
        key: {
            enumberable: false,
            get: function() { return this._key; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, String);
                this._key = val;
            }
        },

        value: {
            enumerable: false,
            get: function() { return this._value; },
            set: function(val) {
                PassUtility.validateFieldValueOrNull(val);
                this._value = val;
            }
        },

        changeMessage: {
            enumerable: false,
            get: function() { return this._changeMessage; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, String);
                this._changeMessage = val;
            }
        },

        label: {
            enumerable: false,
            get: function() { return this._label; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, String);
                this._label = val;
            }
        },

        textAlignment: {
            enumerable: false,
            get: function() { return this._textAlignment; },
            set: function(val) {
                PassUtility.validateTypeOrNull(val, TextAlignment);
                this._textAlignment = val;
            }
        }
    });

    Object.freeze(Field.prototype);

    return Field;
});
