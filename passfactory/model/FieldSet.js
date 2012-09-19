define('model/FieldSet', function() {

    function FieldSet() { }

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
            if (this[name]) delete this[name];
        }
    };

    Object.freeze(FieldSet.prototype);

    return FieldSet;
});
