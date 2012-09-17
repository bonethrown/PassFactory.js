define(['../passgen/model/Field', '../passgen/model/TextAlignment'],
       function(Field, TextAlignment) {
    return {
        runTests: function() {

            module('Field');

            test('Simple Constructor', function() {
                var simpleField = new Field('name', 'Jimmy');
                equal(simpleField.key, 'name', 'key');
                equal(simpleField.value, 'Jimmy', 'value');
                equal(simpleField.label, null, 'label');
                equal(simpleField.changeMessage, null, 'changeMessage');
                equal(simpleField.textAlignment, null, 'textAlignment');
            });

            test('Complex Constructor', function() {
                var date = new Date();
                var complexField = new Field({
                    key: 'date_of_birth',
                    value: date,
                    label: 'Date of Birth',
                    changeMessage: 'date of birth changed',
                    textAlignment: TextAlignment.Left
                });
                equal(complexField.key, 'date_of_birth', 'key');
                equal(complexField.value, date, 'value');
                equal(complexField.label, 'Date of Birth', 'label');
                equal(complexField.changeMessage, 'date of birth changed', 'changeMessage');
                equal(complexField.textAlignment, TextAlignment.Left, 'textAlignment');
            });
        }
    };
});
