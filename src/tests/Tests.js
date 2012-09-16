QUnit.config.autostart = false;

define(['PassTests',
        'PassUtilityTests'], function() {

    QUnit.start();

    for (var i = 0; i < arguments.length; i ++) {
        arguments[i].runTests();
    }
});
