({
    baseUrl: 'passfactory',
    name: 'BuildAMD',
    out: 'build/passfactory-amd.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('EDITION', 'AMD production edition'),
        end: ' '
    },
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
})
