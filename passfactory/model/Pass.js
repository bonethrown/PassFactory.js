define(['Utility',
        'model/FieldSet',
        'model/Barcode',
        'model/Color'],
       
function(Utility, FieldSet, Barcode, Color) {
    'use strict';

    function Pass(args) {

        // Standard keys
        this._description = null;
        this._formatVersion = 1;
        this._organizationName = null;
        this._passTypeIdentifier = null;
        this._serialNumber = null;
        this._teamIdentifier = null;

        // Associated app keys
        this._associatedStoreIdentifiers = [];

        // Relevance keys
        this._locations = [];
        this._relevantDate = null;

        // Style keys
        this._headerFields = new FieldSet();
        this._primaryFields = new FieldSet();
        this._secondaryFields = new FieldSet();
        this._auxiliaryFields = new FieldSet();
        this._backFields = new FieldSet();

        // Visual appearance keys
        this._barcode = null;
        this._backgroundColor = null;
        this._foregroundColor = null;
        this._labelColor = null;
        this._logoText = null;
        this._suppressStripShine = null;

        // Web service keys
        this._authenticationToken = null;
        this._webServiceURL = null;

        if (args) {
            if (args.description) { this.description = args.description; }
            if (args.organizationName) { this.organizationName = args.organizationName; }
            if (args.passTypeIdentifier) { this.passTypeIdentifier = args.passTypeIdentifier; }
            if (args.serialNumber) { this.serialNumber = args.serialNumber; }
            if (args.teamIdentifier) { this.teamIdentifier = args.teamIdentifier; }

            if (args.associatedStoreIdentifiers) { this.associatedStoreIdentifiers = args.associatedStoreIdentifiers; }
            
            if (args.locations) { this.locations = args.locations; }
            if (args.relevantDate) { this.relevantDate = args.relevantDate; }

            if (args.barcode) { this.barcode = args.barcode; }
            if (args.backgroundColor) { this.backgroundColor = args.backgroundColor; }
            if (args.foregroundColor) { this.foregroundColor = args.foregroundColor; }
            if (args.labelColor) { this.labelColor = args.labelColor; }
            if (args.logoColor) { this.logoColor = args.logoColor; }
            if (args.suppressStripShine !== undefined) { this.suppressStripShine = args.suppressStripShine; }

            if (args.authenticationToken) { this.authenticationToken = args.authenticationToken; }
            if (args.webserviceURL) { this.webServiceURL = args.webServiceURL; }
            
            if (args.fileName) { this.fileName = args.fileName; }
            if (args.keyFile) { this.keyFile = args.keyFile; }
            if (args.backgroundImage) { this.backgroundImage = args.backgroundImage; }
            if (args.retinaBackgroundImage) { this.retinaBackgroundImage = args.retinaBackgroundImage; }
            if (args.footerImage) { this.footerImage = args.footerImage; }
            if (args.retinaFooterImage) { this.retinaFooterImage = args.retinaFooterImage; }
            if (args.iconImage) { this.iconImage = args.iconImage; }
            if (args.retinaIconImage) { this.retinaIconImage = args.retinaIconImage; }
            if (args.logoImage) { this.logoImage = args.logoImage; }
            if (args.retinaLogoImage) { this.retinaLogoImage = args.retinaLogoImage; }
            if (args.stripImage) { this.stripImage = args.stripImage; }
            if (args.retinaStripImage) { this.retinaStripImage = args.retinaStripImage; }
        }
    }
    
    Pass.prototype = {
        addHeaderField: function(name, args) { this.headerFields.addField(name, args);  },
        removeHeaderField: function(name) { this.headerFields.removeField(name); },

        addPrimaryField: function(name, args) { this.primaryFields.addField(name, args);  },
        removePrimaryField: function(name) { this.primaryFields.removeField(name); },

        addSecondaryField: function(name, args) { this.secondaryFields.addField(name, args);  },
        removeSecondaryField: function(name) { this.secondaryFields.removeField(name); },

        addAuxiliaryField: function(name, args) { this.auxiliaryFields.addField(name, args);  },
        removeAuxiliaryField: function(name) { this.auxiliaryFields.removeField(name); },

        addBackField: function(name, args) { this.backFields.addField(name, args);  },
        removeBackField: function(name) { this.backFields.removeField(name); },

        // args = {omitCertData: true}
        toJSON: function(args) {
            var omitCertData = !!(args && args.omitCertData);

            var errorMessage = 'Pass not ready to be serialized. Property not yet defined: ';

            var throwPropertyError = function(p) { throw new Error(errorMessage + p); };

            // Standard (required) keys

            if (!this.description) { throwPropertyError('description'); }
            if (!this.organizationName) { throwPropertyError('organizationName'); }
            if (!this.passTypeIdentifier && !omitCertData) { throwPropertyError('passTypeIdentifier'); }
            if (!this.serialNumber) { throwPropertyError('serialNumber'); }
            if (!this.teamIdentifier && !omitCertData) { throwPropertyError('teamIdentifier'); }

            var result = {
                description: this.description,
                formatVersion: this._formatVersion,
                organizationName: this.organizationName,
                passTypeIdentifier: omitCertData ? '**PASS_TYPE_IDENTIFIER**' : this.passTypeIdentifier,
                serialNumber: this.serialNumber,
                teamIdentifier: omitCertData ? '**TEAM_IDENTIFIER**' : this.teamIdentifier
            };

            // Associated app keys
            if (this.associatedStoreIdentifiers.length > 0) { result.associatedStoreIdentifiers = this.associatedStoreIdentifiers; }

            // Relevance keys
            if (this.locations.length > 0) { result.locations = this.locations; }
            if (this.relevantDate) { result.relevantDate = this.relevantDate; }

            // Style keys
            var styleDict = {};

            if (this.headerFields.length > 0) { styleDict.headerFields = this.headerFields; }
            if (this.primaryFields.length > 0) { styleDict.primaryFields = this.primaryFields; }
            if (this.secondaryFields.length > 0) { styleDict.secondaryFields = this.secondaryFields; }
            if (this.auxiliaryFields.length > 0) { styleDict.auxiliaryFields = this.auxiliaryFields; }
            if (this.backFields.length > 0) { styleDict.backFields = this.backFields; }

            result[this.styleKey] = styleDict;

            // Visual appaerance keys
            if (this.barcode) { result.barcode = this.barcode; }
            if (this.backgroundColor) { result.backgroundColor = this.backgroundColor; }
            if (this.foregroundColor) { result.foregroundColor = this.foregroundColor; }
            if (this.labelColor) { result.labelColor = this.labelColor; }
            if (this.logoText) { result.logoText = this.logoText; }
            if (this.suppressStripShine) { result.suppressStripShine = this.suppressStripShine; }

            // Web service keys
            if (this.authenticationToken) { result.authenticationToken = this.authenticationToken; }
            if (this.webServiceURL) { result.webServiceURL = this.webServiceURL; }

            return result;
       }
    };

    Object.defineProperties(Pass.prototype, {

        // Style key (implemented by child classes)

        styleKey: {
            configurable: false,
            get: function() { throw new Error('Method must be called from child class'); }
        },

        // Standard keys

        description: {
            configurable: false,
            get: function() { return this._description; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._description = val;
            }
        },
         
        formatVersion: {
            configurable: false,
            get: function() { return this._formatVersion; }
        },

        organizationName: {
            configurable: false,
            get: function() { return this._organizationName; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._organizationName = val;
            }
        },

        passTypeIdentifier: {
            configurable: false,
            get: function() { return this._passTypeIdentifier; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._passTypeIdentifier = val;
            }
        },

        serialNumber: {
            configurable: false,
            get: function() { return this._serialNumber; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._serialNumber = val;
            }
        },

        teamIdentifier: {
            configurable: false,
            get: function() { return this._teamIdentifier; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._teamIdentifier = val;
            }
        },

        // Associated app keys

        associatedStoreIdentifiers: {
            configurable: false,
            get: function() { return this._associatedStoreIdentifiers; }
        },

        // Relevance keys
        
        locations: {
            configurable: false,
            get: function() { return this._locations; }
        },

        relevantDate: {
            configurable: false,
            get: function() { return this._relevantDate; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Date);
                this._relevantDate = val;
            }
        },

        // Style keys

        headerFields: {
            configurable: false,
            get: function() { return this._headerFields; }
        },

        primaryFields: {
            configurable: false,
            get: function() { return this._primaryFields; }
        },

        secondaryFields: {
            configurable: false,
            get: function() { return this._secondaryFields; }
        },

        auxiliaryFields: {
            configurable: false,
            get: function() { return this._auxiliaryFields; }
        },

        backFields: {
            configurable: false,
            get: function() { return this._backFields; }
        },

        // Visual appearance keys

        barcode: {
            configurable: false,
            get: function() { return this._barcode; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Barcode);
                this._barcode = val;
            }
        },

        backgroundColor: {
            configurable: false,
            get: function() { return this._backgroundColor; },
            set: function(val) {
                if (Utility.isCorrectType(val, String)) {
                    val = new Color(val);
                }

                Utility.validateTypeOrNull(val, Color);
                this._backgroundColor = val;
            }
        },

        foregroundColor: {
            configurable: false,
            get: function() { return this._foregroundColor; },
            set: function(val) {
                if (Utility.isCorrectType(val, String)) {
                    val = new Color(val);
                }

                Utility.validateTypeOrNull(val, Color);
                this._foregroundColor = val;
            }
        },

        labelColor: {
            configurable: false,
            get: function() { return this._labelColor; },
            set: function(val) {
                if (Utility.isCorrectType(val, String)) {
                    val = new Color(val);
                }

                Utility.validateTypeOrNull(val, Color);
                this._labelColor = val;
            }
        },

        logoText: {
            configurable: false,
            get: function() { return this._logoText; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._logoText = val;
            }
        },

        suppressStripShine: {
            configurable: false,
            get: function() { return this._suppressStripShine; },
            set: function(val) {
                Utility.validateTypeOrNull(val, Boolean);
                this._suppressStripShine = val;
            }
        },

        // Web service keys

        authenticationToken: {
            configurable: false,
            get: function() { return this._authenticationToken; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._authenticationToken = val;
            }
        },

        webServiceURL: {
            configurable: false,
            get: function() { return this._webServiceURL; },
            set: function(val) {
                Utility.validateTypeOrNull(val, String);
                this._webServiceURL = val;
            }
        }
    });

    Object.freeze(Pass.prototype);

    return Pass;
});
