define(function() {

	"use strict";

    var TransitType = {
        Air: 'PKTransitTypeAir',
        Boat: 'PKTransitTypeBoat',
        Bus: 'PKTransitTypeBus',
        Generic: 'PKTransitTypeGeneric',
        Train: 'PKTransitTypeTrain'
    };

    return Object.freeze(TransitType);
});
