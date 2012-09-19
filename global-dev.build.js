({
    baseUrl: 'passfactory',
    name: 'Core',
    out: 'build/passfactory-global-dev.js',
    optimize: 'none',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', 'Global export development version') + '(function() {',
        end: '}());'
    },
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
})
