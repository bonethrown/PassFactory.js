function Designer() {
    this._certificateFileButton = $('#certificateFileButton');
    this._certificateFileClearButton = $('#certificateFileClearButton');
    this._certificateFileInputContainer = $('#certificateFileInputContainer');
    this._certificateFileInput = $('#certificateFileInput');

    this._passTypeInput = $('#styleKey');
    this._descriptionInput = $('#description');
    this._organizationNameInput = $('#organization');
    this._passTypeIdentifierInput = $('#passTypeIdentifier');
    this._teamIdentifierInput = $('#teamIdentifier');
    this._serialNumberInput = $('#serialNumber');

    this._generateSerialNumberButton = $('#generateSerialNumber');

    this._logoTextInput = $('#logoText');

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

    this._generatePassButton = $('#generateButton');
    this._validationErrorContainer = $('#validationErrorContainer');
    this._downloadButtonContainer = $('#downloadLinkContainer');

    this.initialize();
}

Designer.prototype = {
    initialize: function() {
        // Register input change handlers
        this._descriptionInput.change(this._stringInputValidator(true));
        this._organizationNameInput.change(this._stringInputValidator(true));
        this._passTypeIdentifierInput.change(this._stringInputValidator(true));
        this._teamIdentifierInput.change(this._stringInputValidator(true));
        this._serialNumberInput.change(this._stringInputValidator(true));
        this._serialNumberInput.change(this._stringInputValidator(true));

        this._logoTextInput.change(this._stringInputValidator(false));

        // Register click handlers
        this._generateSerialNumberButton.click(this.generateSerialNumber.bind(this));

        this._hookUpFileButtonHandlers(this._certificateFileButton,
                                       this._certificateFileClearButton,
                                       this._certificateFileInput,
                                       this._certificateFileInputContainer,
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

        this._hookUpFileButtonHandlers(this._iconImageButton,
                                       this._iconImageClearButton,
                                       this._iconImageInput,
                                       this._iconImageInputContainer,
                                       false);

        this._hookUpFileButtonHandlers(this._retinaIconImageButton,
                                       this._retinaIconImageClearButton,
                                       this._retinaIconImageInput,
                                       this._retinaIconImageInputContainer,
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
            'Pass Type Identifier': this._passTypeIdentifierInput, 
            'Team Identifier': this._teamIdentifierInput, 
            'Serial Number': this._serialNumberInput
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
                var inputElement = namesToElements[name];
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

    generatePass: function() {
        if (this.validateAllInputs()) {
            var pass = new PassFactory.GenericPass({
                keyFile: this._certificateFileInput.get(0).files[0],
                description: this._descriptionInput.val(),
                organizationName: this._organizationNameInput.val(),
                passTypeIdentifier: this._passTypeIdentifierInput.val(),
                teamIdentifier: this._teamIdentifierInput.val(),
                serialNumber: this._serialNumberInput.val()
            });

            if (this._logoTextInput.val()) pass.logoText = this._logoTextInput.val();
            
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
        }
    }
};

$(document).ready(function() {
    window.Designer = new Designer();
});

