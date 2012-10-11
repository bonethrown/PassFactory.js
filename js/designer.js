function Designer() {
    this._certificateFileButton = $('#certificateFileButton');
    this._certificateFileClearButton = $('#certificateFileClearButton');
    this._certificateFileInputContainer = $('#certificateFileInputContainer');
    this._certificateFileInput = $('#certificateFileInput');

    this._passTypeInput = $('#styleKey');
    this._transitTypeInput = $('#transitType');
    this._transitTypeInputContainer = $(this._transitTypeInput.parent().parent());
    this._descriptionInput = $('#description');
    this._organizationNameInput = $('#organization');
    this._serialNumberInput = $('#serialNumber');

    this._generateSerialNumberButton = $('#generateSerialNumber');

    this._logoTextInput = $('#logoText');
    this._backgroundColorInput = $('#backgroundColor');
    this._foregroundColorInput = $('#foregroundColor');
    this._labelColorInput = $('#labelColor');
    this._stripShineInput = $('#stripShine');

    this._backgroundImageButton = $('#backgroundImageButton');
    this._backgroundImageClearButton = $('#backgroundImageClearButton');
    this._backgroundImageInputContainer = $('#backgroundImageInputContainer');
    this._backgroundImageInput = $('#backgroundImageInput');

    this._retinaBackgroundImageButton = $('#retinaBackgroundImageButton');
    this._retinaBackgroundImageClearButton = $('#retinaBackgroundImageClearButton');
    this._retinaBackgroundImageInputContainer = $('#retinaBackgroundImageInputContainer');
    this._retinaBackgroundImageInput = $('#retinaBackgroundImageInput');

    this._footerImageButton = $('#footerImageButton');
    this._footerImageClearButton = $('#footerImageClearButton');
    this._footerImageInputContainer = $('#footerImageInputContainer');
    this._footerImageInput = $('#footerImageInput');

    this._retinaFooterImageButton = $('#retinaFooterImageButton');
    this._retinaFooterImageClearButton = $('#retinaFooterImageClearButton');
    this._retinaFooterImageInputContainer = $('#retinaFooterImageInputContainer');
    this._retinaFooterImageInput = $('#retinaFooterImageInput');

    this._iconImageButton = $('#iconImageButton');
    this._iconImageClearButton = $('#iconImageClearButton');
    this._iconImageInputContainer = $('#iconImageInputContainer');
    this._iconImageInput = $('#iconImageInput');

    this._retinaIconImageButton = $('#retinaIconImageButton');
    this._retinaIconImageClearButton = $('#retinaIconImageClearButton');
    this._retinaIconImageInputContainer = $('#retinaIconImageInputContainer');
    this._retinaIconImageInput = $('#retinaIconImageInput');

    this._logoImageButton = $('#logoImageButton');
    this._logoImageClearButton = $('#logoImageClearButton');
    this._logoImageInputContainer = $('#logoImageInputContainer');
    this._logoImageInput = $('#logoImageInput');

    this._retinaLogoImageButton = $('#retinaLogoImageButton');
    this._retinaLogoImageClearButton = $('#retinaLogoImageClearButton');
    this._retinaLogoImageInputContainer = $('#retinaLogoImageInputContainer');
    this._retinaLogoImageInput = $('#retinaLogoImageInput');

    this._stripImageButton = $('#stripImageButton');
    this._stripImageClearButton = $('#stripImageClearButton');
    this._stripImageInputContainer = $('#stripImageInputContainer');
    this._stripImageInput = $('#stripImageInput');

    this._retinaStripImageButton = $('#retinaStripImageButton');
    this._retinaStripImageClearButton = $('#retinaStripImageClearButton');
    this._retinaStripImageInputContainer = $('#retinaStripImageInputContainer');
    this._retinaStripImageInput = $('#retinaStripImageInput');

    this._thumbnailImageButton = $('#thumbnailImageButton');
    this._thumbnailImageClearButton = $('#thumbnailImageClearButton');
    this._thumbnailImageInputContainer = $('#thumbnailImageInputContainer');
    this._thumbnailImageInput = $('#thumbnailImageInput');

    this._retinaThumbnailImageButton = $('#retinaThumbnailImageButton');
    this._retinaThumbnailImageClearButton = $('#retinaThumbnailImageClearButton');
    this._retinaThumbnailImageInputContainer = $('#retinaThumbnailImageInputContainer');
    this._retinaThumbnailImageInput = $('#retinaThumbnailImageInput');

    this._relevantDate = null;
    this._includeRelevantDateCheckbox = $('#includeRelevantDate');
    this._relevantDateContainer = $('#relevantDateContainer');
    this._relevantDateInput = $('#relevantDate');
    this._relevantTimeInput = $('#relevantTime');
    this._relevantTimeZoneInput = $('#relevantTimeZone');

    this._locationControls = [];
    this._addLocationButton = $('#addLocation');
    this._locationsContainer = $('#locationsContainer');

    this._includeBarcodeCheckbox = $('#includeBarcode');
    this._barcodeContainer = $('#barcodeContainer');
    this._barcodeTypeInput = $('#barcodeType');
    this._barcodeMessageInput = $('#barcodeMessage');
    this._barcodeTextInput = $('#barcodeText');
    this._barcodeEncodingInput = $('#barcodeEncoding');

    this._generatePassButton = $('#generateButton');
    this._validationErrorContainer = $('#validationErrorContainer');
    this._downloadButtonContainer = $('#downloadLinkContainer');

    this.initialize();
}

Designer.prototype = {
    initialize: function() {

        // Hook up type picker
        this._passTypeInput.change(function() {
            switch (this._passTypeInput.val()) {
                case 'boardingPass':
                    this._transitTypeInputContainer.removeClass('hidden');
                    break;
                case 'coupon':
                    this._transitTypeInputContainer.addClass('hidden');
                    break;
                case 'eventTicket':
                    this._transitTypeInputContainer.addClass('hidden');
                    break;
                case 'generic':
                    this._transitTypeInputContainer.addClass('hidden');
                    break;
                case 'storeCard':
                    this._transitTypeInputContainer.addClass('hidden');
                    break;
            };
        }.bind(this));

        // Hook up date and time pickers
        this._relevantDateInput.datepicker().on('changeDate', function(e) {
            this._relevantDate = e.date;
        }.bind(this));

        this._relevantTimeInput.timepicker({
            minuteStep: 5
        });

        var d = new Date();

        // Set up relevant date
        this._relevantDateInput.datepicker('setValue', d);
        var localOffset = d.getTimezoneOffset().toString();
        this._relevantTimeZoneInput.val(localOffset);
        this._includeRelevantDateCheckbox.change(this._optInSectionCheckBoxValidator(this._relevantDateContainer));

        // Set up locations
        this._addLocationButton.click(function() {
            this._locationControls.push(new LocationControl(this, this._locationsContainer));
        }.bind(this));

        // Set up barcode
        this._includeBarcodeCheckbox.change(this._optInSectionCheckBoxValidator(this._barcodeContainer));
        this._barcodeMessageInput.change(this._stringInputValidator(true));
        this._barcodeTextInput.change(this._stringInputValidator(false));
        this._barcodeEncodingInput.change(this._stringInputValidator(true));

        // Register input change handlers
        this._descriptionInput.change(this._stringInputValidator(true));
        this._organizationNameInput.change(this._stringInputValidator(true));
        this._serialNumberInput.change(this._stringInputValidator(true));
        this._serialNumberInput.change(this._stringInputValidator(true));

        this._logoTextInput.change(this._stringInputValidator(false));
        this._backgroundColorInput.change(this._stringInputValidator(false));
        this._foregroundColorInput.change(this._stringInputValidator(false));
        this._labelColorInput.change(this._stringInputValidator(false));

        // Register click handlers
        this._generateSerialNumberButton.click(this.generateSerialNumber.bind(this));

        this._hookUpFileButtonHandlers(this._certificateFileButton,
                                       this._certificateFileClearButton,
                                       this._certificateFileInput,
                                       this._certificateFileInputContainer,
                                       true);

        this._hookUpFileButtonHandlers(this._iconImageButton,
                                       this._iconImageClearButton,
                                       this._iconImageInput,
                                       this._iconImageInputContainer,
                                       true);

        this._hookUpFileButtonHandlers(this._retinaIconImageButton,
                                       this._retinaIconImageClearButton,
                                       this._retinaIconImageInput,
                                       this._retinaIconImageInputContainer,
                                       true);

        this._hookUpFileButtonHandlers(this._backgroundImageButton,
                                       this._backgroundImageClearButton,
                                       this._backgroundImageInput,
                                       this._backgroundImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._retinaBackgroundImageButton,
                                       this._retinaBackgroundImageClearButton,
                                       this._retinaBackgroundImageInput,
                                       this._retinaBackgroundImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._footerImageButton,
                                       this._footerImageClearButton,
                                       this._footerImageInput,
                                       this._footerImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._retinaFooterImageButton,
                                       this._retinaFooterImageClearButton,
                                       this._retinaFooterImageInput,
                                       this._retinaFooterImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._logoImageButton,
                                       this._logoImageClearButton,
                                       this._logoImageInput,
                                       this._logoImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._retinaLogoImageButton,
                                       this._retinaLogoImageClearButton,
                                       this._retinaLogoImageInput,
                                       this._retinaLogoImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._stripImageButton,
                                       this._stripImageClearButton,
                                       this._stripImageInput,
                                       this._stripImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._retinaStripImageButton,
                                       this._retinaStripImageClearButton,
                                       this._retinaStripImageInput,
                                       this._retinaStripImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._thumbnailImageButton,
                                       this._thumbnailImageClearButton,
                                       this._thumbnailImageInput,
                                       this._thumbnailImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._retinaThumbnailImageButton,
                                       this._retinaThumbnailImageClearButton,
                                       this._retinaThumbnailImageInput,
                                       this._retinaThumbnailImageInputContainer,
                                       false);

        this._generatePassButton.click(this.generatePass.bind(this));
    },

    _stringInputValidator: function(required, predicate) {
        return function(e) {
            var input = $(e.target);
            var container = $(input.parent().parent());
            var val = input.val();

            if (val.length > 0 && (!predicate || predicate(val))) {
                container.removeClass('error');
                container.addClass('success');
            } else {
                container.removeClass('success');
                if (required) container.addClass('error');
            }
        };
    },

    _optInSectionCheckBoxValidator: function(div) {
        return function(e) {
            var checkbox = $(e.target);
            var container = $(checkbox.parent().parent());

            if (checkbox.prop('checked')) {
                container.addClass('success');
                div.removeClass('hidden');
            } else {
                container.removeClass('success');
                div.addClass('hidden');
            }
        }
    },

    _hookUpFileButtonHandlers: function(fileButton, clearButton, input, container, required) {
        // The input change handler needs to be reusable
        var inputChange = function(e) {
            var input = e.target;
            var container = $($(input).parent().parent().parent()); // gross, I know

            if (input.files && input.files.length > 0) {

                fileButton.text(input.files[0].name);
                fileButton.removeClass('btn-danger');
                fileButton.addClass('btn-success');

                container.removeClass('error');
                container.addClass('success');

                clearButton.removeClass('hidden');
            } else {

                fileButton.html('Choose File <i class="icon-chevron-right' + (required ? ' icon-white' : '') + '"></i>');
                fileButton.removeClass('btn-success');
                if (required) fileButton.addClass('btn-danger');

                container.removeClass('success');
                if (required) container.addClass('error');

                clearButton.addClass('hidden');
            }
        };

        // Hook up the input change handler initially
        input.change(inputChange);

        // The file button click handler needs to be able
        // to be regenerated and pointed at a diffent input
        generateFileButtonClickHandler = function(input) {
            return function(e) {
                var button = $(e.target);
                e.preventDefault();
                input.click();
            };
        };
        
        // Hook up file button click handler initially
        fileButton.click(generateFileButtonClickHandler(input));

        // Hook up clear button click handler
        clearButton.click(function(e) {
            // We can't change or clear an input element's file(s),
            // so we have to destroy it and create it again.
            input.remove();            
            var newInput = $('<input type="file"/>').appendTo(container);
            newInput.change(inputChange);

            // Register new file button click handlers
            fileButton.off('click');
            fileButton.click(generateFileButtonClickHandler(newInput));

            newInput.change(); // trigger change event
        });

    },

    removeLocationControl: function(control) {
        if (this._locationControls.indexOf(control) > -1) {
            this._locationControls.splice(this._locationControls.indexOf(control), 1);
        }
    },

    generateSerialNumber: function() {
        // Generate a UUID v4 (sans hyphens) and use it for the pass's
        // serial number.
        // <http://en.wikipedia.org/wiki/Universally_unique_identifier>
        // (from http://stackoverflow.com/a/2117523)
        this._serialNumberInput.val('xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g,
            function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
        }));
        this._serialNumberInput.change(); // fire change event for validators
    },

    validateAllInputs: function() {
        var namesToElements = {
            'Certificate/Key File': this._certificateFileInput, 
            'Description': this._descriptionInput, 
            'Organization Name': this._organizationNameInput, 
            'Serial Number': this._serialNumberInput,
            'Barcode Data': [this._barcodeMessageInput, function() { return this._includeBarcodeCheckbox.prop('checked'); }.bind(this) ],
            'Barcode Encoding': [this._barcodeEncodingInput, function() { return this._includeBarcodeCheckbox.prop('checked'); }.bind(this) ],
            'Icon Image': this._iconImageInput,
            '2x Icon Image': this._retinaIconImageInput
        };

        var getContainer = function(input) {
            var container = input;
            while (container && !container.hasClass('control-group')) {
                container = container.parent();
            }

            return container;
        };

        var isValid = function(input) {
            var container = getContainer(input);
            return container && container.hasClass('success');
        };

        var allValid = true;
        var errorHtml = '';

        for (var name in namesToElements) {
            if (namesToElements.hasOwnProperty(name)) {
                var val = namesToElements[name];

                var inputElement;

                if (val instanceof Array) {
                    if (!val[1]()) break;
                    inputElement = val[0];
                } else {
                    inputElement = val;
                }

                if (!isValid(inputElement)) {
                    allValid = false;
                    errorHtml += '<li>' + name + '</li>';
                }
            }
        }

        if (!allValid) {
            var alertHtml = '<div class="alert alert-block alert-error">' +
                                '<button type="button" class="close" data-dismiss="alert">x</button>' +
                                '<h4>Error</h4>' +
                                'The following are missing or incorrect and need to be fixed before a pass can be generated:' +
                                '<ul>' +
                                errorHtml +
                                '</ul>' +
                            '</div>';
            this._validationErrorContainer.html(alertHtml);
        }

        return allValid;
    },

    _getRelevantDate: function(dateToDay, timeInput, timezoneOffset) {
        var date = new Date(dateToDay.getTime());

        var parsedTimeString = timeInput.val().match(/(\d\d):(\d\d) ([AP]M)/);

        var hour = parseInt(parsedTimeString[1], 10),
            minute = parseInt(parsedTimeString[2], 10),
            meridian = parsedTimeString[3];

        if (meridian === 'PM') hour += 12;

        date.setHours(hour);
        date.setMinutes(minute + (timezoneOffset - date.getTimezoneOffset()));
        date.setSeconds(0);

        return date;
    },

    generatePass: function() {
        if (this.validateAllInputs()) {

            var passTypesToConstructors = {
                'boardingPass': PassFactory.BoardingPass,
                'coupon': PassFactory.Coupon,
                'eventTicket': PassFactory.EventTicket,
                'generic': PassFactory.GenericPass,
                'storeCard': PassFactory.StoreCard
            };

            var constructor = passTypesToConstructors[this._passTypeInput.val()];

            var pass = new constructor({
                keyFile: this._certificateFileInput.get(0).files[0],
                description: this._descriptionInput.val(),
                organizationName: this._organizationNameInput.val(),
                serialNumber: this._serialNumberInput.val()
            });

            if (constructor === PassFactory.BoardingPass) pass.transitType = this._transitTypeInput.val();

            if (this._logoTextInput.val()) pass.logoText = this._logoTextInput.val();
            if (this._backgroundColorInput.val()) pass.backgroundColor = this._backgroundColorInput.val();
            if (this._foregroundColorInput.val()) pass.foregroundColor = this._foregroundColorInput.val();
            if (this._labelColorInput.val()) pass.labelColor = this._labelColorInput.val();
            if (!this._stripShineInput.prop('checked')) pass.suppressStripShine = true;

            if (this._includeRelevantDateCheckbox.prop('checked')) {
                pass.relevantDate = this._getRelevantDate(this._relevantDate, this._relevantTimeInput, parseInt(this._relevantTimeZoneInput.val()));
            }

            if (this._includeBarcodeCheckbox.prop('checked')) {
                var barcode = new PassFactory.Barcode({
                    format: this._barcodeTypeInput.val(),
                    message: this._barcodeMessageInput.val(),
                    messageEncoding: this._barcodeEncodingInput.val()
                });

                if (this._barcodeTextInput.val()) barcode.altText = this._barcodeTextInput.val();

                pass.barcode = barcode;
            }

            for (var i = 0; i < this._locationControls.length; i ++) {
                var locationControl = this._locationControls[i];

                pass.locations.push(locationControl.location);
            }
            
            if (this._backgroundImageInput.get(0).files.length > 0) pass.backgroundImage = this._backgroundImageInput.get(0).files[0];
            if (this._retinaBackgroundImageInput.get(0).files.length > 0) pass.retinaBackgroundImage = this._retinaBackgroundImageInput.get(0).files[0];
            if (this._footerImageInput.get(0).files.length > 0) pass.footerImage = this._footerImageInput.get(0).files[0];
            if (this._retinaFooterImageInput.get(0).files.length > 0) pass.retinaFooterImage = this._retinaFooterImageInput.get(0).files[0];
            if (this._iconImageInput.get(0).files.length > 0) pass.iconImage = this._iconImageInput.get(0).files[0];
            if (this._retinaIconImageInput.get(0).files.length > 0) pass.retinaIconImage = this._retinaIconImageInput.get(0).files[0];
            if (this._logoImageInput.get(0).files.length > 0) pass.logoImage = this._logoImageInput.get(0).files[0];
            if (this._retinaLogoImageInput.get(0).files.length > 0) pass.retinaLogoImage = this._retinaLogoImageInput.get(0).files[0];
            if (this._stripImageInput.get(0).files.length > 0) pass.stripImage = this._stripImageInput.get(0).files[0];
            if (this._retinaStripImageInput.get(0).files.length > 0) pass.retinaStripImage = this._retinaStripImageInput.get(0).files[0];
            if (this._thumbnailImageInput.get(0).files.length > 0) pass.thumbnailImage = this._thumbnailImageInput.get(0).files[0];
            if (this._retinaThumbnailImageInput.get(0).files.length > 0) pass.retinaThumbnailImage = this._retinaThumbnailImageInput.get(0).files[0];
            
            pass.toAppleScript(function(script) {
                this._downloadButtonContainer.downloadify({
                    swf: '/media/downloadify.swf',
                    downloadImage: '/img/download.png',
                    width: 102,
                    height: 38,
                    filename: 'generate_pass.scpt',
                    data: script,
                    dataType: 'string'
                });
            }.bind(this));

            // Put the result in the global scope, just in case anyone wants to inspect it
            window.pass = pass;
        }
    }
};

$(document).ready(function() {
    window.Designer = new Designer();
});

