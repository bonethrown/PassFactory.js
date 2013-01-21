define(['model/Barcode',
        'model/BarcodeFormat',
        'model/BoardingPass',
        'model/Color',
        'model/Coupon',
        'model/Location',
        'model/EventTicket',
        'model/GenericPass',
        'model/StoreCard',
        'model/TextAlignment',
        'model/TransitType'],
        
function(Barcode, BarcodeFormat, BoardingPass, Color, Coupon, Location,
         EventTicket, GenericPass, StoreCard, TextAlignment, TransitType) {
    'use strict';

    var PassFactory = {

        // Pass types
        BoardingPass: BoardingPass,
        Coupon: Coupon,
        EventTicket: EventTicket,
        GenericPass: GenericPass,
        StoreCard: StoreCard,

        // Complex Properties
        Color: Color,
        Location: Location,

        // Enums
        Barcode: Barcode,
        BarcodeFormat: BarcodeFormat,
        TextAlignment: TextAlignment,
        TransitType: TransitType
    };

    return Object.freeze(PassFactory);
});
