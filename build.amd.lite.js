({
    baseUrl: 'passfactory',
    name: 'PassFactoryLite',
    out: 'build/passfactorylite-' + fs.readFileSync('VERSION', 'utf8') + '.amd.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', fs.readFileSync('VERSION', 'utf8')).replace('EDITION', 'AMD lite edition'),
        end: ' '
    }
})
