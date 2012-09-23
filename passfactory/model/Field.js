define('model/Field', ['Utility', 'model/TextAlignment'],
       function(Utility, TextAlignment) {

    function Field(args) {
        this._key = null;
        this._value = null;
        this._changeMessage = null;
        this._label = null;
        this._textAlignment = null;

        Utility.validateType(args, Object);

        this.key = args.key || null;
        if (args.value) this.value = args.value;
        if (args.changeMessage) this.changeMessage = args.changeMessage;
        if (args.label) this.label = args.label;
        if (args.textAlignment) this.textAlignment = args.textAlignment;
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
                Utility.validateTypeOrNull(val, String);
                this._key = val;
            }
        },

        value: {
            enumerable: false,
            get: function() { return this._value; },
            set: function(val) {
                Utility.validateFieldValueOrNull(val);
                this._value = val;
            }
        },

        changeMessage: {
            enumerable: false,
            get: function() { return this._changeMessage; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._changeMessage = val;
            }
        },

        label: {
            enumerable: false,
            get: function() { return this._label; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._label = val;
            }
        },

        textAlignment: {
            enumerable: false,
            get: function() { return this._textAlignment; },
            set: function(val) {
                Utility.validateTypeOrNull(val, TextAlignment);
                this._textAlignment = val;
            }
        }
    });

    Object.freeze(Field.prototype);

    return Field;
});
