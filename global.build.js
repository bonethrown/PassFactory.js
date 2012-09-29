({
    baseUrl: 'passfactory',
    name: 'almond',
    include: ['BuildGlobal'],
    insertRequire: ['BuildGlobal'],
    out: 'build/passfactory.min.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('EDITION', 'Global export production edition') + '(function() {',
        end: '}());'
    },
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
})
