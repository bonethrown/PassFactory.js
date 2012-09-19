define('model/BarcodeFormat', function() {
    return Object.freeze({
        QR: 'PKBarcodeFormatQR',
        PDF417: 'PKBarcodeFormatPDF417',
        Aztec: 'PKBarcodeFormatAztec'
    });
});
