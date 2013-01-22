/**
 * Use this file as the build target to register PassFactory in the global
 * namespace
 */
define(['PassFactoryLite'], function(PassFactoryLite) {
    if (window) {
        window.$PF = window.PassFactory = PassFactoryLite;
    }
});
