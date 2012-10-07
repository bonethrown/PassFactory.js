({
    baseUrl: 'passfactory',
    name: 'PassFactory',
    out: 'build/passfactory-0.1.0.amd.min.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', 'v0.1.0').replace('EDITION', 'AMD production edition'),
        end: ' '
    },
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
})
