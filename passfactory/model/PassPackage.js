define('model/PassPackage', ['Utility', 'lib/jszip', 'text!text/generate_pass.rb', 'text!text/generate_pass.scpt'],
        function(Utility, JSZip, rubyText, appleScriptText) {

    function PassPackage(pass) {
        this.pass = pass;
    }

    PassPackage.prototype = {

        _getManifestData: function(passData, zip, callback) {
            var manifest = {};

            manifest['pass.json'] = Utility.sha1(passData);

            var pendingUploads = 0;

            var returnIfReady = function() {
                if (pendingUploads < 1) callback(JSON.stringify(manifest, null, '    '));
            };

            var loadIfExists = function(image, imageName) {
                if (image) {
                    pendingUploads ++;
                    Utility.sha1File(image, function(sha1, fileData) {
                        manifest[imageName] = sha1;
                        zip.file(imageName, fileData, { binary: true });
                        pendingUploads --;
                        returnIfReady();
                    });
                }
            };

            loadIfExists(this.backgroundImage, 'background.png');
            loadIfExists(this.retinaBackgroundImage, 'background@2x.png');
            loadIfExists(this.footerImage, 'footer.png');
            loadIfExists(this.retinaFooterImage, 'footer@2x.png');
            loadIfExists(this.iconImage, 'icon.png');
            loadIfExists(this.retinaIconImage, 'iconImage@2x.png');
            loadIfExists(this.logoImage, 'logo.png');
            loadIfExists(this.retinaLogoImage, 'logo@2x.png');
            loadIfExists(this.stripImage, 'strip.png');
            loadIfExists(this.retinaStripImage, 'strip@2x.png');

            returnIfReady();
        },
        
        toZip: function(callback) {
            var passData = JSON.stringify(this.pass, null, '    ') + '\n';
            var zip = new JSZip();

            this._getManifestData(passData, zip, function(manifestData) {
                zip.file('pass.json', passData, zip);
                zip.file('manifest.json', manifestData);
                
                callback(zip.generate());
            });
        },

        toZipDataUrl: function(callback) {
            return this.toZip(function(data) {
                callback('data:application/zip;base64,' + data);
            });
        },

        toAppleScript: function(callback) {
            return this.toZip(function(zipData) {
                Utility.base64File(this.keyFile, function(keyData) {
                    var ruby = rubyText.replace('**PASS_NAME**', this.passFileName || 'Pass')
                                       .replace('**ZIP_DATA**', Utility.lineBreakRubyStringLiteral(zipData))
                                       .replace('**KEY_DATA**', Utility.lineBreakRubyStringLiteral(keyData));
                    var appleScript = appleScriptText.replace('**RUBY_FILE_CONTENT**', ruby.replace(/^/gm, '        '));

                    callback(appleScript);
                }.bind(this));
            }.bind(this));
        },

        toAppleScriptDataUrl: function(callback) {
            this.toAppleScript(function(script) {
                callback('data:application/x-applescript;base64,' + Utility.base64(script));
            });
        }
    };

    Object.defineProperties(PassPackage.prototype, {
        pass: {
            configurable: false,
            get: function() { return this._pass; },
            set: function(val) { this._pass = val; }
        },

        passFileName: {
            configurable: false,
            get: function() { return this._passFileName; },
            set: function(val) {
                Utility.validateType(val, String);
                this._passFileName = val;
            }
        },

        keyFile: {
            configurable: false,
            get: function() { return this._keyFile; },
            set: function(val) {
                Utility.validateType(val, File);
                this._keyFile = val;
            }
        },

        backgroundImage: {
            configurable: false,
            get: function() { return this._backgroundImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._backgroundImage = val;
            }
        },

        retinaBackgroundImage: {
            configurable: false,
            get: function() { return this._retinaBackgroundImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaBackgroundImage = val;
            }
        },

        footerImage: {
            configurable: false,
            get: function() { return this._footerImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._footerImage = val;
            }
        },

        retinaFooterImage: {
            configurable: false,
            get: function() { return this._retinaFooterImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaFooterImage = val;
            }
        },

        iconImage: {
            configurable: false,
            get: function() { return this._iconImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._iconImage = val;
            }
        },

        retinaIconImage: {
            configurable: false,
            get: function() { return this._retinaIconImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaIconImage = val;
            }
        },

        logoImage: {
            configurable: false,
            get: function() { return this._logoImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._logoImage = val;
            }
        },

        retinaLogoImage: {
            configurable: false,
            get: function() { return this._retinaLogoImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaLogoImage = val;
            }
        },

        stripImage: {
            configurable: false,
            get: function() { return this._stripImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._stripImage = val;
            }
        },

        retinaStripImage: {
            configurable: false,
            get: function() { return this._retinaStripImage; },
            set: function(val) {
                Utility.validateType(val, File);
                this._retinaStripImage = val;
            }
        }
    });

    Object.freeze(PassPackage.prototype);

    return PassPackage;

});
