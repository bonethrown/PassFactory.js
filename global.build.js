({
    baseUrl: 'passfactory',
    name: 'Core',
    out: 'build/passfactory-global.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', 'Global export production version') + '(function() {',
        end: '}());'
    },
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
})
