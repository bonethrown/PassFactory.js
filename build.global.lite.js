({
    baseUrl: 'passfactory',
    name: 'almond',
    include: ['_globallite'],
    insertRequire: ['_globallite'],
    out: 'build/passfactorylite-' + fs.readFileSync('VERSION', 'utf8') + '.js',
    wrap: {
        start: fs.readFileSync('BANNER', 'utf8').replace('VERSION', fs.readFileSync('VERSION', 'utf8')).replace('EDITION', 'Global export lite edition') + '(function() {',
        end: '}());'
    }
})
