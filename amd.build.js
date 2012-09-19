({
    baseUrl: 'passfactory',
    name: 'Core',
    out: 'build/passfactory-amd.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', 'AMD production version'),
        end: ' '
    },
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
})
