require.config({
    paths: {
        'underscore': 'external/underscore',
        'sha1': 'external/sha1',
        'zip': 'external/zip'
    }
});

define('Core', ['model/Barcode', 'model/BarcodeFormat', 'model/Color', 'model/Field', 'model/FieldSet', 'model/Pass', 'model/PassPackage', 'model/TextAlignment', 'Utility'],
        function(Barcode, BarcodeFormat, Color, Field, FieldSet, Pass, PassPackage, TextAlignment, Utility) {

    var PassFactory = {
        Barcode: Barcode,
        BarcodeFormat: BarcodeFormat,
        Color: Color,
        Pass: Pass,
        TextAlignment: TextAlignment,
        lib: {
            Field: Field,
            FieldSet: FieldSet,
            Utility: Utility,
            PassPackage: PassPackage
        }
    };

    Object.freeze(PassFactory);

    return PassFactory;
});
