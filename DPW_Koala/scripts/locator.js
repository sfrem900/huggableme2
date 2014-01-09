(function (global) {
    var map,
        geocoder,
        LocationViewModel,
        app = global.app = global.app || {};

    LocationViewModel = kendo.data.ObservableObject.extend({
        _isLoading: false,

        address: "",
        isGoogleMapsInitialized: false,
        
        submitHref: function() {
            return "#request-service?addr=" + this.get("address");
        },
        
        onNavigateHome: function () {
            var that = this,
                position;

            that._isLoading = true;
            that.showLoading();

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.panTo(position);      //The panTo gives an animated effect on small moves.
                    map.setCenter(position);  //The setCenter is for the initial reverseGeocode to work on page load.
                    that.reverseGeocode();

                    that._isLoading = false;
                    that.hideLoading();
                },
                function (error) {
                    //default map coordinates
                    position = new google.maps.LatLng(34.085148, -118.150068);
                    map.panTo(position);
                    
                    navigator.notification.alert("Unable to get current location. Please drag map or type in your the location address",
                            function () { }, "Location Not Found", 'OK');
                    that.set("address", "Drag map or type address");

                    that._isLoading = false;
                    that.hideLoading();
                },
                {
                    timeout: 5000,
                    enableHighAccuracy: true
                }
            );
        },

        onSearchAddress: function () {
            var that = this;
            
            that._isLoading = true;
            that.showLoading();

            var LACountySW = new google.maps.LatLng(32.44,-119.95);
            var LACountyNE = new google.maps.LatLng(34.91,-117.51);
            
            geocoder.geocode(
                {
                    'address': that.get("address"),
                    'bounds' : new google.maps.LatLngBounds(LACountySW, LACountyNE)
                },
                function (results, status) {
                    that._isLoading = false;
                    that.hideLoading();
                    
                    if (status !== google.maps.GeocoderStatus.OK) {
                        navigator.notification.alert("Unable to find address.",
                            function () { }, "Search failed", 'OK');

                        return;
                    }
                    map.panTo(results[0].geometry.location);
                    that.set("address", results[0].formatted_address.replace(", USA", ""));
$("#btnRequestService").attr("href", that.submitHref());                    
                });
        },

        reverseGeocode: function () {
            var that = this;

            that.set("address", "Updating location...");
            var c = map.getCenter();
            var latlng = new google.maps.LatLng(c.lat(), c.lng());

            geocoder.geocode(
            	{
                     'latLng': latlng, 
                }, 
            	function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            //that.set("address", results[0].address_components[0].long_name);
                            that.set("address", results[0].formatted_address.replace(", USA", ""));                            
$("#btnRequestService").attr("href", that.submitHref());
                        } else {
                            alert('No results found');
                        }
                    } else {
                        // call the DPW geocoder as a fallback option
                        $.get( "http://dpw.lacounty.gov/lib/ws/gis/webservices/reversegeocoder.aspx", { lat: c.lat(), lon: c.lng() } )
                        .done(function( xml ) {    
                            //$(xml).find("city").each(function() { alert($(this).text()); });
                            that.set("address", $(xml).find("address").text() + ", " + $(xml).find("city").text() + ", " + $(xml).find("state").text() + " " + $(xml).find("zip").text());
                        });                        
                    }
                });            
            
        },        
        
        showLoading: function () {
            if (this._isLoading) {
                app.application.showLoading();
            }
        },

        hideLoading: function () {
            app.application.hideLoading();
        },

    });

    app.locationService = {
        initLocation: function () {
            var mapOptions;

            if (typeof google === "undefined"){
                return;
            } 

            app.locationService.viewModel.set("isGoogleMapsInitialized", true);

            mapOptions = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: true,
                mapTypeControlOptions: {
            	    mapTypeIds: [google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID],
            		style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },                
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },
                streetViewControl: false
            };

            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
            geocoder = new google.maps.Geocoder();
            app.locationService.viewModel.onNavigateHome.apply(app.locationService.viewModel, []);
            
        	google.maps.event.addListener(map, 'dragend', function() {
                app.locationService.viewModel.reverseGeocode();
        	});	
            
            kendo.bind($("#locator"), app.locationService.viewModel);
        },

        show: function () {
            if (!app.locationService.viewModel.get("isGoogleMapsInitialized")) {
                return;
            }

            //show loading mask in case the location is not loaded yet 
            //and the user returns to the same tab
            app.locationService.viewModel.showLoading();

            //resize the map in case the orientation has been changed while showing other tab
            google.maps.event.trigger(map, "resize");
        },

        hide: function () {
            //hide loading mask if user changed the tab as it is only relevant to location tab
            app.locationService.viewModel.hideLoading();
        },

        viewModel: new LocationViewModel()
    };
}
)(window);

(function (global) {
    RequestViewModel = kendo.data.ObservableObject.extend({
        useraddr: "",
        
        hideLoading: function () {
            app.application.hideLoading();
        },

    });

    app.requestService = {
        initRequest: function (e) {
            kendo.bind($("#request-service"), app.requestService.viewModel);
        },
        show: function (e) {
            app.requestService.viewModel.set("useraddr", e.view.params.addr);
        },

        //Submit Form 
        submit_form: function (e) {
            $.post('TestPost.aspx', app.requestService.viewModel, function (data) {
                // This is executed when the call to web service was succesful.
                // 'data' contains the response from the request
                alert(data);
            }).error(function (xhr, ajaxOptions, thrownError, request, error) {
                alert('xrs.status = ' + xhr.status + '\n' +
                         'thrown error = ' + thrownError + '\n' +
                         'xhr.statusText = ' + xhr.statusText + '\n' +
                         'request = ' + request + '\n' +
                         'error = ' + error);
            });
            
            e.preventDefault();
        },
        
        viewModel: new RequestViewModel()
    };
}
)(window);