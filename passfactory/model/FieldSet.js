define(['model/Field'], function(Field) {

    "use strict";

    function FieldSet() {
        this._length = 0;
    }

    FieldSet.prototype = {
        addField: function(name, args) {
            var privateName = '_' + name;
            this[privateName] = new Field(args);

            Object.defineProperty(this, name, {
                configurable: true,
                get: function() { return this[privateName].value; },
                set: function(val) { this[privateName].value = val; }
            });
        },

        removeField: function(name) {
            if (this[name])  {
                delete this[name];
                delete this['_' + name];
                this._length --;
            }
        },

        toJSON: function() {
            var result = [];

            for (var property in this) {
                if (this.hasOwnProperty(property) && this[property] instanceof Field) {
                    result.push(this[property]);
                }
            }

            return result;
        }
    };

    Object.defineProperties(FieldSet.prototype, {
        length: {
            configurable: false,
            get: function() { return this._length; }
        }
    });

    Object.freeze(FieldSet.prototype);

    return FieldSet;
});
