define('model/BarcodeFormat', function() {

	"use strict";
	
    return Object.freeze({
        QR: 'PKBarcodeFormatQR',
        PDF417: 'PKBarcodeFormatPDF417',
        Aztec: 'PKBarcodeFormatAztec'
    });
});
