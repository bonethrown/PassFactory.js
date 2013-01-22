({
    baseUrl: 'passfactory',
    name: 'PassFactory',
    out: 'build/passfactory-' + fs.readFileSync('VERSION', 'utf8') + '.amd.min.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', fs.readFileSync('VERSION', 'utf8')).replace('EDITION', 'AMD edition'),
        end: ' '
    },
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
})
