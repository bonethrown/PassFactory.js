define(function() {
	'use strict';

	var BarcodeFormat = {
        QR: 'PKBarcodeFormatQR',
        PDF417: 'PKBarcodeFormatPDF417',
        Aztec: 'PKBarcodeFormatAztec'
	};
	
    return Object.freeze(BarcodeFormat);
});
