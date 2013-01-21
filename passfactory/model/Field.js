define(['Utility',
        'model/TextAlignment',
        'model/DateStyle',
        'model/NumberStyle'],

function(Utility, TextAlignment, DateStyle, NumberStyle) {
    'use strict';

    function Field(args) {
        this._key = null;
        this._value = null;
        this._changeMessage = null;
        this._label = null;
        this._textAlignment = null;

        this._dateStyle = null;
        this._timeStyle = null;
        this._isRelative = null;

        this._currencyCode = null;
        this._numberStyle = null;

        Utility.validateType(args, Object);

        this.key = args.key || null;
        if (args.value) { this.value = args.value; }
        if (args.changeMessage) { this.changeMessage = args.changeMessage; }
        if (args.label) { this.label = args.label; }
        if (args.textAlignment) { this.textAlignment = args.textAlignment; }

        if (args.dateStyle) { this.dateStyle = args.dateStyle; }
        if (args.timeStyle) { this.timeStyle = args.timeStyle; }
        if (args.isRelative !== undefined) { this.isRelative = args.isRelative; }

        if (args.currencyCode) { this.currencyCode = args.currencyCode; }
        if (args.numberStyle) { this.numberStyle = args.numberStyle; }
    }
    
    Field.prototype = {
        toJSON: function() {
            var message = 'Field not ready to be serialized. Missing property : ';

            if (!this.key) { throw new Error(message + 'key'); }
            if (!this.value) { throw new Error(message + 'value'); }

            var result = {
                key: this.key,
                value: this.value
            };

            if (this.changeMessage) { result.value = this.changeMessage; }
            if (this.label) { result.label = this.label; }
            if (this.textAlignment) { result.textAlignment = this.textAlignment; }

            if (this.dateStyle) { result.dateStyle = this.dateStyle; }
            if (this.timeStyle) { result.timeStyle = this.timeStyle; }
            if (this.isRelative !== null) { result.isRelative = this.isRelative; }

            if (this.currencyCode) { result.currencyCode = this.currencyCode; }
            if (this.numberStyle) { result.numberStyle = this.numberStyle; }

            return result;
        }
    };

    Object.defineProperties(Field.prototype, {
        key: {
            configurable: false,
            get: function() { return this._key; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._key = val;
            }
        },

        value: {
            configurable: false,
            get: function() { return this._value; },
            set: function(val) {
                Utility.validateFieldValueOrNull(val);
                this._value = val;
            }
        },

        changeMessage: {
            configurable: false,
            get: function() { return this._changeMessage; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._changeMessage = val;
            }
        },

        label: {
            configurable: false,
            get: function() { return this._label; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._label = val;
            }
        },

        textAlignment: {
            configurable: false,
            get: function() { return this._textAlignment; },
            set: function(val) {
                Utility.validateTypeOrNull(val, TextAlignment);
                this._textAlignment = val;
            }
        },

        dateStyle: {
            configurable: false,
            get: function() { return this._dateStyle; },
            set: function(val) {
                Utility.validateTypeOrNull(val, DateStyle);
                this._dateStyle = val;
            }
        },

        timeStyle: {
            configurable: false,
            get: function() { return this._timeStyle; },
            set: function(val) {
                Utility.validateTypeOrNull(val, DateStyle);
                this._timeStyle = val;
            }
        },

        isRelative: {
            configurable: false,
            get: function() { return this._isRelative; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Boolean);
                this._isRelative = val;
            }
        },

        currencyCode: {
            configurable: false,
            get: function() { return this._currencyCode; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._currencyCode = val;
            }
        },

        numberStyle: {
            configurable: false,
            get: function() { return this._numberStyle; },
            set: function(val) {
                Utility.validateTypeOrNull(val, NumberStyle);
                this._numberStyle = val;
            }
        }
    });

    Object.freeze(Field.prototype);

    return Field;
});
