# PassFactory.js - iOS 6 passes (almost) from your web browser

[Try it on the web](#) or download it (below).

## Usage

*TODO*

## Download

*TODO*

## License

PassFactory.js is released under the MIT license:

    Copyright (C) 2012 Jimmy Theis

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

## Building

To build PassFactory.js, make sure you have [Node.js](http://nodejs.org/) and
[the Require.js optimizer](http://requirejs.org/docs/optimization.html#download)
installed, then navigate a terminal to the root of this repository.

### For AMD users:

    $ r.js -o build.amd.js          # production version
    $ r.js -o build.amd.lite.js     # "lite" version (no packaging/building)

### For global export users:
 
    $ r.js -o build.global.js       # production version
    $ r.js -o build.global.lite.js  # "lite" version (no packaging/building)

## Development versions:

To build any of the above four editions as an unminified development version,
simply include `optimize=none` as an argument to the build command:

    $ r.js -o build.global.js optimize=none

All resulting files should appear in the `build/` directory.
