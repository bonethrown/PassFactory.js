define(['Utility'],

function(Utility) {

	"use strict";

	function Location(args) {

		this._latitude = null;
		this._longitude = null;
		this._altitude = null;
		this._relevantText = null;

		// Required
		if (args && args.latitude) this.latitude = args.latitude;
		if (args && args.longitude) this.longitude = args.longitude;

		// Optional
		if (args && args.altitude) this.altitude = args.altitude;
		if (args && args.relevantText) this.relevantText = args.relevantText;
	}

	Location.prototype = {
		toJSON: function() {
			if (this.latitude === null) throw new Error('Location not ready to be serialized: latitude not defined');
			if (this.longitude === null) throw new Error('Location not ready to be serialized: longitude not defined');

			var result = {
				latitude: this.latitude,
				longitude: this.longitude
			};

			if (this.altitude !== null) result.altitude = this.altitude;
			if (this.relevantText !== null) result.relevantText = this.relevantText;
		}
	};

	Object.defineProperties(Location.prototype, {
		latitude: {
			configurable: false,
			get: function() { return this._latitude; },
			set: function(val) {
				Utility.validateType(val, Number);
				this._latitude = val;
			}
		},

		longitude: {
			configurable: false,
			get: function() { return this._longitude; },
			set: function(val) {
				Utility.validateType(val, Number);
				this._longitude = val;
			}
		},

		altitude: {
			configurable: false,
			get: function() { return this._altitude; },
			set: function(val) {
				Utility.validateTypeOrNull(val, Number);
				this._altitude = val;
			}
		},

		relevantText: {
			configurable: false,
			get: function() { return this._relevantText; },
			set: function(val) {
				Utility.validateTypeOrNull(val, String),
				this._relevantText = val;
			}
		}
	});

	Object.freeze(Location.prototype);

	return Location;
});