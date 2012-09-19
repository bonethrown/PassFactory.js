({
    baseUrl: 'passfactory',
    name: 'Core',
    out: 'build/passfactory-amd-dev.js',
    optimize: 'none',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', 'AMD development version'),
        end: ' '
    },
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
})
