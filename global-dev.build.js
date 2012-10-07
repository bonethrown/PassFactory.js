({
    baseUrl: 'passfactory',
    name: 'almond',
    include: ['BuildGlobal'],
    insertRequire: ['BuildGlobal'],
    out: 'build/passfactory-0.1.0.js',
    optimize: 'none',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', 'v0.1.0').replace('EDITION', 'Global export development edition') + '(function() {',
        end: '}());'
    },
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
})
