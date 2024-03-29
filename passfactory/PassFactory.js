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
        'model/TransitType',
        'model/PassPackage'],
        
function(Barcode, BarcodeFormat, BoardingPass, Color, Coupon, Location,
         EventTicket, GenericPass, StoreCard, TextAlignment, TransitType,
         PassPackage) {
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
        TransitType: TransitType,

        // Package
        PassPackage: PassPackage
    };

    return Object.freeze(PassFactory);
});
