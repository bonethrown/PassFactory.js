({
    baseUrl: 'passfactory',
    name: 'almond',
    include: ['_global'],
    insertRequire: ['_global'],
    out: 'build/passfactory-' + fs.readFileSync('VERSION', 'utf8') + '.min.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', fs.readFileSync('VERSION', 'utf8')).replace('EDITION', 'Global export production edition') + '(function() {',
        end: '}());'
    },
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
})
