define(['underscore', 'sha1', 'zip'], function(_, CryptoJS, JSZip) {
    return {

        sha1: function(str) {
            return CryptoJS.SHA1(str).toString();
        },

        // callback(sha1, fileData)
        sha1File: function(file, callback) {
            var fileReader = new FileReader();

            fileReader.onload = function() {
                var fileData = fileReader.result;
                var sha1 = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(fileData)).toString();
                callback(sha1, fileData);
            };

            fileReader.readAsBinaryString(file);
        },

        /**
         * From: http://www.webtoolkit.info/javascript-base64.html
         */
        base64: function(str) {
            _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            var utf8_encode = function(s) {
                s = s.replace(/\r\n/g,"\n");
                var utftext = "";
                for (var n = 0; n < s.length; n++) {
                    var c = s.charCodeAt(n);
                    if (c < 128) utftext += String.fromCharCode(c);
                    else if (c > 127 && c < 2048) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            };
 
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
 
            str = utf8_encode(str);
 
            while (i < str.length) {
 
                chr1 = str.charCodeAt(i++);
                chr2 = str.charCodeAt(i++);
                chr3 = str.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
 
            }
 
            return output;
        },

        base64File: function(file, callback) {
            var fileReader = new FileReader();

            fileReader.onload = function() {
                var result = fileReader.result;
                callback(result.slice(result.indexOf(',') + 1));
            };

            fileReader.readAsDataURL(file);
        },

        lineBreakRubyStringLiteral: function(str) {
            var len = 50;
            var result = str.slice(0, len);

            for (var i = len; i < str.length; i += len) {
                result += "\n              " + str.slice(i, i + len);
            }

            return result;
        },

        isValidFieldValue: function(val) {
            return this.isCorrectType(val, String) ||
                   this.isCorrectType(val, Number) ||
                   this.isCorrectType(val, Date);
        },

        isCorrectType: function(obj, type) {
            switch (type) {
                case String:
                    return obj instanceof String ||
                           typeof obj === 'string';
                case Number:
                    return obj instanceof Number ||
                           typeof obj === 'number';
                default:
                    // Enums
                    if (typeof type === 'object') {
                        return _.values(type).indexOf(obj) > -1;
                    }
                    
                    // Regular inheritance case
                    return obj instanceof type;
            }
        },

        validateType: function(obj, type) {
            if (!this.isCorrectType(obj, type)) {
                throw new TypeError(obj + ' is not of type ' + type);
            }
        },

        validateTypeOrNull: function(obj, type) {
            if (!this.isCorrectType(obj, type) || obj === null) {
                throw new TypeError(obj + ' is not of type ' + type);
            }
        },

        validateFieldValue: function(obj) {
            if (!this.isValidFieldValue(obj)) {
                throw new TypeError(obj + ' is not a valid field value');
            }
        },

        validateFieldValueOrNull: function(obj) {
            if (!this.isValidFieldValue(obj) || obj === null) {
                throw new TypeError(obj + ' is not a valid field value');
            }
        }
    };
});
