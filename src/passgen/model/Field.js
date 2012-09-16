define('Field', ['../PassUtility'], function(PassUtility) {
    function Field(keyOrArgs, value) {
        this._key = null;
        this._value = null;
        this._changeMessage = null;
        this._label = null;
        this._textAlignment = null;

        if (keyOrArgs.type === 'string' || keyOrArgs instanceof String) {
            key = keyOrArgs;
        } else {
            PassUtility.validateType(keyOrArgs, Object);

            var args = keyOrArgs;

            if (key) this.key = key;
            else if (args.key) this.key = args.key;

            if (args.value) this.value = args.value;
            if (args.changeMessage) this.changeMessage = args.changeMessage;
            if (args.label) this.label = args.label;
            if (args.textAlignment) this.textAlignment = args.textAlignment;
        }

    }
    
    Field.prototype = {
        toJSON: function() {
            return { 
                key: this.key,
                value: this.value,
                changeMessage: this.changeMessage,
                label: this.label,
                textAlignment: this.textAlignment
            };
        }
    };

    Object.defineProperty(Field.prototype, 'key', {
        enumberable: false,
        get: function() { return this._key; },
        set: function(val) {
            this._key = val;
        }
    });

    Object.defineProperty(Field.prototype, 'value', {
        enumerable: false,
        get: function() { return this._value; },
        set: function(val) {
            this._value = val;
        }
    });

    Object.defineProperty(Field.prototype, 'changeMessage', {
        enumerable: false,
        get: function() { return this._changeMessage; },
        set: function(val) {
            this._changeMessage = val;
        }
    });

    Object.defineProperty(Field.prototype, 'label', {
        enumerable: false,
        get: function() { return this._label; },
        set: function(val) {
            this._label = val;
        }
    });

    Object.defineProperty(Field.prototype, 'textAlignment', {
        enumerable: false,
        get: function() { return this._textAlignment; },
        set: function(val) {
            this._textAlignment = val;
        }
    });

    return Pass;
});
