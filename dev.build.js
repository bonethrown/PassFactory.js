({
    baseUrl: 'passfactory',
    name: 'Core',
    optimize: 'none',
    out: 'build/passfactory-dev.js',
    preserveLicenseComments: false,
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
})
