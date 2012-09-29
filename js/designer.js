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

    this._generatePassButton = $('#generateButton');
    this._validationErrorContainer = $('#validationErrorContainer');
    this._downloadButtonContainer = $('#downloadLinkContainer');

    this.initialize();
}

Designer.prototype = {
    initialize: function() {
        var requiredStringValidator = function(e) {
        };

        // Register input change handlers
        this._descriptionInput.change(this._stringInputValidator());
        this._organizationNameInput.change(this._stringInputValidator());
        this._passTypeIdentifierInput.change(this._stringInputValidator());
        this._teamIdentifierInput.change(this._stringInputValidator());
        this._serialNumberInput.change(this._stringInputValidator());
        this._serialNumberInput.change(this._stringInputValidator());

        // Register click handlers
        this._generateSerialNumberButton.click(this.generateSerialNumber.bind(this));

        this._hookUpFileButtonHandlers(this._certificateFileButton,
                                       this._certificateFileClearButton,
                                       this._certificateFileInput,
                                       this._certificateFileInputContainer);

        this._generatePassButton.click(this.generatePass.bind(this));
    },

    _stringInputValidator: function(predicate) {
        return function(e) {
            var input = $(e.target);
            var container = $(input.parent().parent());
            var val = input.val();

            if (val.length > 0 && (!predicate || predicate(val))) {
                container.removeClass('error');
                container.addClass('success');
            } else {
                container.removeClass('success');
                container.addClass('error');
            }
        };
    },

    _hookUpFileButtonHandlers: function(fileButton, clearButton, input, container) {
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

                fileButton.html('Choose File <i class="icon-chevron-right icon-white"></i>');
                fileButton.removeClass('btn-success');
                fileButton.addClass('btn-danger');

                container.removeClass('success');
                container.addClass('error');

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
            this._downloadButtonContainer.downloadify({
                swf: '/media/downloadify.swf',
                downloadImage: '/img/download.png',
                width: 102,
                height: 38,
                filename: 'generate_pass.scpt',
                data: 'AAAAA',
                dataType: 'base64'
            });
        }
    }
};

$(document).ready(function() {
    new Designer();
});

