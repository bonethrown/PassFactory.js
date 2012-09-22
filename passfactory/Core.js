require.config({
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    },
    shim: {
        'external/base64': {
            exports: 'Base64'
        }
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
