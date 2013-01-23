/**
 * Use this file as the build target to register PassFactory in the global
 * namespace
 */
define(['PassFactory'], function(PassFactory) {
    'use strict';
    
    if (window) {
        window.$PF = window.PassFactory = PassFactory
    }
});