define('model/PassPackage', ['zip'], function(JSZip) {

    function PassPackage(pass) {
        this.pass = pass;
    }

    PassPackage.prototype = {

        _getManifestData: function(passData, zip) {
            return '{ }\n';
        },
        
        toBase64Zip: function() {
            var passData = JSON.stringify(this.pass, null, '    ') + '\n';
            var manifestData = this._getManifestData(passData);

            var zip = new JSZip();
            zip.file('pass.json', passData, zip);
            zip.file('manifest.json', manifestData);

            return zip.generate();
        },

        toBase64ZipLinkData: function() {
            return 'data:application/zip;base64,' + this.toBase64Zip();
        },

        toBase64Script: function() {
            var zipData = this.toBase64Zip();
        },

        toBase64ScriptLinkData: function() {
            return 'data:application/zip;base64,' + this.toBase64Script();
        }
    };

    Object.defineProperties(PassPackage.prototype, {
        pass: {
            configurable: false,
            get: function() { return this._pass; },
            set: function(val) { this._pass = val; }
        }
    });

    Object.freeze(PassPackage.prototype);

    return PassPackage;

});
