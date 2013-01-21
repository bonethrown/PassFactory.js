/**
 * Use this file as the build target to register PassFactory in the global
 * namespace
 */
define(['PassFactory'], function(PassFactory) {
    if (window) {
        window.$PF = window.PassFactory = PassFactory
    }
});