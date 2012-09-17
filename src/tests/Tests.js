QUnit.config.autostart = false;

define(['PassTests',
        'PassUtilityTests',
        'FieldTests'], function() {

    QUnit.start();

    for (var i = 0; i < arguments.length; i ++) {
        if (arguments[i].runTests) arguments[i].runTests();
    }
});
