/**
 * Use this file as the build target to register PassFactory in the global
 * namespace
 */
define(['PassFactoryLite'], function(PassFactoryLite) {
    'use strict';
    
    if (window) {
        window.$PF = window.PassFactory = PassFactoryLite;
    }
});
