define(['../passgen/util/PassUtility'], function(PassUtility) {
    return {
        runTests: function() {

            module('PassUtility');

            test('PassUtility.isCorrectType()', function() {
                equal(true, PassUtility.isCorrectType('a', String),
                    "'a', String");
                equal(true, PassUtility.isCorrectType(3, Number),
                    '3, Number');
                equal(true, PassUtility.isCorrectType(new Date(), Date),
                    'new Date(), Date');
                equal(false, PassUtility.isCorrectType('a', Object),
                    "'a', Object (false)");
                equal(false, PassUtility.isCorrectType(2, String),
                    '2, String (false)');
                equal(false, PassUtility.isCorrectType(undefined, Object),
                    'undefined, Object (false)');
                equal(false, PassUtility.isCorrectType(null, Object),
                    'null, Object (false)');
            });

            test('PassUtlility.validateType()', function() {
                // these shouldn't throw
                PassUtility.validateType('abc', String,
                    "'abc', String");
                PassUtility.validateType(5, Number,
                    '5, Number');
                PassUtility.validateType([], Array,
                    '[], Array');
                PassUtility.validateType({}, Object,
                    '{}, Object');
                PassUtility.validateType([], Object,
                    '[], Object');
                
                // these should throw
                throws(function() {
                    PassUtility.validateType(5, String);
                }, TypeError, '5, String');

                throws(function() {
                    PassUtility.validateType('abc', Number);
                }, TypeError, "'abc', Number");

                throws(function() {
                    PassUtility.validateType('abc', Object);
                }, TypeError, "'abc', Object");

                throws(function() {
                    PassUtility.validateType(null, Object);
                }, TypeError, 'null, Object');
            });

            test('PassUtility.isValidFieldValue()', function() {
                ok(PassUtility.isValidFieldValue('a'),
                    "'a'");
                ok(PassUtility.isValidFieldValue(new Date()),
                    'new Date()');
                ok(PassUtility.isValidFieldValue(3),
                    '3');
                ok(!PassUtility.isValidFieldValue(true),
                    'true (false)');
                ok(!PassUtility.isValidFieldValue(false),
                    'false (false)');
                ok(!PassUtility.isValidFieldValue(undefined),
                    'undefined (false)');
                ok(!PassUtility.isValidFieldValue(null),
                    'null (false)');
                ok(!PassUtility.isValidFieldValue({}),
                    '{} (false)');
                ok(!PassUtility.isValidFieldValue([]),
                    '[] (false)');
            });
        }
    };
});
