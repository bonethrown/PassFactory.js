({
    baseUrl: 'passfactory',
    name: 'Core',
    out: 'build/passfactory-global.js',
    wrap: true,
    preserveLicenseComments: false,
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
})
