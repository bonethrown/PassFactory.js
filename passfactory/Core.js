require.config({
    shim: {
        'lib/crypto-js-sha1': { exports: 'CryptoJS' },
        'lib/jszip': { exports: 'JSZip' },
        'lib/underscore': { exports: '_' }
    }
});

define('Core', ['model/Barcode', 'model/BarcodeFormat', 'model/BoardingPass', 'model/Color', 'model/Coupon', 'model/EventTicket', 'model/GenericPass', 'model/StoreCard', 'model/TextAlignment'],
        function(Barcode, BarcodeFormat, BoardingPass, Color, Coupon, EventTicket, GenericPass, StoreCard, TextAlignment) {

    var PassFactory = {

        // Pass types
        BoardingPass: BoardingPass,
        Coupon: Coupon,
        EventTicket: EventTicket,
        GenericPass: GenericPass,
        StoreCard: StoreCard,

        // Enums
        Barcode: Barcode,
        BarcodeFormat: BarcodeFormat,
        Color: Color,
        TextAlignment: TextAlignment

    };

    Object.freeze(PassFactory);

    return PassFactory;
});
