define(['underscore', 'sha1', 'zip'], function(_, CryptoJS, JSZip) {
    return {
        sha1OfString: function(str) {
            return CryptoJS.SHA1(str).toString();
        },

        // callback(fileDataAsString, sha1)
        sha1OfFile: function(file, callback) {
            var fileReader = new FileReader();
            fileReader.onload = function() {
                var fileData = fileReader.result;
                var sha1 = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(fileData)).toString();
                callback(sha1);
            };
            fileReader.readAsBinaryString(file);
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
