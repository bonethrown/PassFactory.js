define(['Utility',
        'model/FieldSet',
        'model/Barcode',
        'model/Color'],
       
function(Utility, FieldSet, Barcode, Color) {
    'use strict';

    function Pass(args) {

        function argOr(prop, alt) {
            if (args && args[prop] !== null && args[prop] !== null) {
                return args[prop];
            }
            if (alt !== undefined) { return alt; }
            return null;
        }

        // Standard keys
        this._description = argOr('description', null);
        this._formatVersion = 1;
        this._organizationName = argOr('organizationName', null);
        this._passTypeIdentifier = argOr('passTypeIdentifier', null);
        this._serialNumber = argOr('serialNumber', null);
        this._teamIdentifier = argOr('teamIdentifier', null);

        // Associated app keys
        this._associatedStoreIdentifiers = argOr('associatedStoreIdentifiers',
                                                 []);

        // Relevance keys
        this._locations = argOr('locations', []);
        this._relevantDate = argOr('relevantDate', null);

        // Style keys
        this._headerFields = new FieldSet();
        this._primaryFields = new FieldSet();
        this._secondaryFields = new FieldSet();
        this._auxiliaryFields = new FieldSet();
        this._backFields = new FieldSet();

        // Visual appearance keys
        this._barcode = argOr('barcode', null);
        this._backgroundColor = argOr('backgroundColor', null);
        this._foregroundColor = argOr('foregroundColor', null);
        this._labelColor = argOr('labelColor', null);
        this._logoText = argOr('logoText', null);
        this._suppressStripShine = argOr('suppressStripShine', null);

        // Web service keys
        this._authenticationToken = argOr('authenticationToken', null);
        this._webServiceUrl = argOr('webServiceUrl', null);

        var that = this;
        function basicProperty(name, type) {
            var localName = '_' + name;
            return {
                get: function() { return that[localName]; },
                set: function(val) {
                    Utility.validateTypeOrNull(val, type);
                    that[localName] = val;
                }
            };
        }

        function colorProperty(name) {
            var localName = '_' + name;
            return {
                get: function()  { return that[localName]; },
                set: function(val) {
                    if (Utility.isCorrectType(val, String)) {
                        val = new Color(val);
                    }

                    Utility.validateTypeOrNull(val, Color);
                    that[localName] = val;
                }
            };
        }

        Object.defineProperties(this, {
            addHeaderField: { value: this.headerFields.addField },
            removeHeaderField: { value: this.headerFields.removeField },
            addPrimaryField: { value: this.primaryFields.addField },
            removePrimaryField: { value: this.primaryFields.removeField },
            addSecondaryField: { value: this.secondaryFields.addField },
            removeSecondaryField: { value: this.secondaryFields.removeField },
            addAuxiliaryField: { value: this.auxiliaryFields.addField },
            removeAuxiliaryField: { value: this.auxiliaryFields.removeField },
            addBackField: { value: this.backFields.addField },
            removeBackField: { value: this.backFields.removeField },

            description: basicProperty('description', String),
            organizationName: basicProperty('organizationName', String),
            passTypeIdentifier: basicProperty('passTypeIdentifier', String),
            serialNumber: basicProperty('serialNumber', String),
            teamIdentifier: basicProperty('teamIdentifier', String),
            relevantDate: basicProperty('relevantDate', Date),
            barcode: basicProperty('barcode', Barcode),
            logoText: basicProperty('logoText', String),
            suppressStripShine: basicProperty('suppressStripShine', Boolean),
            authenticationToken: basicProperty('authenticationToken', String),
            webServiceUrl: basicProperty('webServiceUrl', String),

            foregroundColor: colorProperty('foregroundColor'),
            backgroundColor: colorProperty('backgroundColor'),
            labelColor: colorProperty('labelColor'),

            styleKey: {
                get: function() {
                    throw new Error('Method must be called from child class');
                }
            },
             
            formatVersion: { value: this._formatVersion },
            associatedStoreIdentifiers: {
                value: this._associatedStoreIdentifiers
            },
            locations: { value: this._locations },
            headerFields: { value: this._headerFields },
            primaryFields: { value: this._primaryFields },
            secondaryFields: { value: this._secondaryFields },
            auxiliaryFields: { value: this._auxiliaryFields },
            backFields: { value: this._backFields },

            toJSON: { value: function(args) {
                var omitCertData = !!(args && args.omitCertData);

                var errorMessage = 'Pass not ready to be serialized. ' +
                                   'Property not yet defined: ';

                function throwPropertyError(p) {
                    throw new Error(errorMessage + p);
                }

                // Standard (required) keys

                if (!this.description) {
                    throwPropertyError('description');
                }
                if (!this.organizationName) {
                    throwPropertyError('organizationName');
                }
                if (!this.passTypeIdentifier && !omitCertData) {
                    throwPropertyError('passTypeIdentifier');
                }
                if (!this.serialNumber) {
                    throwPropertyError('serialNumber');
                }
                if (!this.teamIdentifier && !omitCertData) {
                    throwPropertyError('teamIdentifier');
                }

                var result = {
                    description: this.description,
                    formatVersion: this._formatVersion,
                    organizationName: this.organizationName,
                    passTypeIdentifier: omitCertData ?
                                            '**PASS_TYPE_IDENTIFIER**' :
                                            this.passTypeIdentifier,
                    serialNumber: this.serialNumber,
                    teamIdentifier: omitCertData ?
                                        '**TEAM_IDENTIFIER**' :
                                        this.teamIdentifier
                };

                var that = this;
                function copyProp(p) {
                    if (that[p] !== null) { result[p] = that[p]; }
                }

                // Associated app keys
                if (this.associatedStoreIdentifiers.length > 0) {
                    result.associatedStoreIdentifiers =
                        this.associatedStoreIdentifiers;
                }

                // Relevance keys
                if (this.locations.length > 0) {
                    result.locations = this.locations;
                }
                copyProp('relevantDate');

                // Style keys
                var styleDict = {};

                function copyFields(f) {
                    if (that[f].length > 0) { styleDict[f] = that[f]; }
                }

                copyFields('headerFields');
                copyFields('primaryFields');
                copyFields('secondaryFields');
                copyFields('auxiliaryFields');
                copyFields('backFields');

                result[this.styleKey] = styleDict;

                // Visual appaerance keys
                copyProp('barcode');
                copyProp('backgroundColor');
                copyProp('foregroundColor');
                copyProp('labelColor');
                copyProp('logoText');
                copyProp('suppressStripShine');

                // Web service keys
                copyProp('authenticationToken');
                copyProp('webServiceUrl');

                return result;
            }}
        });
    }

    return Pass;
});
