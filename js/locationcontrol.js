(function () {

    function LocationControl(designer, container) {
        this._designer = designer;
        this._container = container;
        this._element = null;
        this._mapElement = null;
        this._map = null;
        this._marker = null;
        this._labelInput = null;
        this._removeButton = null;
    
        this._initialize();
    }
    
    LocationControl.prototype = {
    
        _initialize: function() {
            this._element = $(
                '<div class="locationControl">' +
                    '<div class="map"></div>' + 
                    '<div class="control-group">' +
                        '<label class="control-label">Label:</label>' +
                        '<div class="controls">' +
                            '<input class="input-xlarge" type="text" id="locationLabel" />' +
                            '<a href="#">' +
                                '<i class="icon-info-sign"></i>' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="control-group">' + 
                        '<div class="controls">' + 
                            '<button id="removeLocation" type="button" class="btn btn-danger"><i class="icon-trash icon-white"></i> Remove Location</button>' + 
                        '</div>' + 
                    '</div>' + 
                    '<hr />' + 
                '</div>'
            ).appendTo(this._container);

            this._mapElement = this._element.find('.map').get(0);
            this._labelInput = this._element.find('#locationLabel');
            this._removeButton = this._element.find('#removeLocation');

            this._removeButton.click(this.destroy.bind(this));

            console.log(this._mapElement);

            this._map = new google.maps.Map(this._mapElement, {
                center: new google.maps.LatLng(41.891614, -87.599401),
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false
            });

            this._marker = new google.maps.Marker({
                    position: this._map.getCenter(),
                    map: this._map,
                    animation: google.maps.Animation.DROP,
                    draggable: true
             });
    
            google.maps.event.addListener(this._map, 'click', function(event) {

                if (this._marker) this._marker.setMap(null);
    
                this._marker = new google.maps.Marker({
                    position: event.latLng,
                    map: this._map,
                    animation: google.maps.Animation.DROP,
                    draggable: true
                });

            }.bind(this));
        },

        destroy: function() {
            this._designer.removeLocationControl(this);
            this._element.remove();
        }
    };
    
    Object.defineProperties(LocationControl.prototype, {
        location: {
            get: function() {
                var location = this._marker.getPosition();

                var args = {
                    latitude: location.lat(),
                    longitude: location.lng()
                };

                if (this._labelInput.val()) args.relevantText = this._labelInput.val();

                return new PassFactory.Location(args);
            }
        }
    });
    
    window.LocationControl = LocationControl;

} ());