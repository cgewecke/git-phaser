var gl_debug;

// @component: GeoLocate - a service and directive 
// for Geolocation, reverse geocoding, and map display
angular.module('linkedin')
  .service("GeoLocate", GeoLocate)
  .directive("beaconMap", BeaconMap);

//@ directive: <beacon-map></beacon-map>
//@ params: 'slide' binds to a variable in the outer scope. If slide's val is '1',
//  		the map is either initialized or updated. e.g. updates triggered on the slide
//  		coming into view.
function BeaconMap(GeoLocate){
    return {
       restrict: 'E',   
       scope: {slide: '=slide'},
       template: '<div id="map"></div>',
       link: function searchboxEventHandlers(scope, elem, attrs){

       		// Unit Testing exposure
       		scope.GeoLocate = GeoLocate;

       		// Map must be a fixed size, so expand for IPad
			ionic.Platform.isIPad() ? elem.addClass('ipad') : false;
			
			// Load or update map when slide view is toggled to map	
			scope.$watch('slide', function(newVal, oldVal){

				if (newVal === 1){
					(GeoLocate.map === null) ? 
						GeoLocate.loadMap(): 
						GeoLocate.updateMap();
				};
			})
       }
    };
 };

// @service: GeoLocate
// @params: $rootScope, $q, $cordovaGeolocation
//
// 
function GeoLocate($rootScope, $q, $cordovaGeolocation){

	var icon, map;
	var self = this;

	// $cordovaGeolocation options
	var posOptions = {timeout: 60000, enableHighAccuracy: false};

	// Mapbox API
	var token = 'pk.eyJ1IjoiZXBpbGVwb25lIiwiYSI6ImNpanRyY3IwMjA2cmp0YWtzdnFoenhkbjkifQ._Sg2cIhMaGfU6gpKMmrGBA';
    var id = 'epilepone.2f443807';
	
	// Public 
	self.lat = null;
	self.lng = null;
	self.address = null;
	self.enabled = false;
	self.map = null;
	self.marker = null;

	// @function: setup
	//
	// Runs in the nearby route resolve block to trigger permissions, detect whether
	// geolocation is enabled.
	self.setup = function(){
		var deferred = $q.defer();

		if ($rootScope.DEV){
			deferred.resolve(self.address); 
			return deferred.promise; 
		}
		
		$cordovaGeolocation.getCurrentPosition(posOptions).then(

			function (success){
		    	self.enabled = true;
		    	MSLog('@GeoLocate:setup. Geolocation enabled')
		    	deferred.resolve();
		    }, function (error){
		    	self.enabled = false;
		    	MSLog('@GeoLocate:setup. Geolocation disabled');
		    	deferred.resolve();
		    }
		);
		return deferred.promise;
	};

	// @function: loadMap
	// Loads a Leaflet map with MapBox titles using devices current coordinate
	self.loadMap = function(){
		self.getAddress().then(function(){

          self.map = L.map('map');
          self.map.setView([self.lat, self.lng], 16);
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: '',
              zoomControl: false,
              id: id,
              accessToken: token 
          }).addTo(self.map);

          icon = L.icon.pulse({iconSize:[17,17], color:'#387EF5'});
          self.marker = L.marker([self.lat, self.lng],{icon: icon}).addTo(self.map);

        });
	};

	// @function: updateMap
	// Resets map view and marker to current device coordinates
	self.updateMap = function(){

		self.getAddress().then(function(){
          self.map.setView([self.lat, self.lng], 16);
          self.marker.setLatLng([self.lat, self.lng]);
        });
	}

	// @function: getAddress
	// @return: promise which resolves either an address string or ''.
	//
	// Gets device coordinates and sets public vars 'lat', 'lng'.
	// Reverse geocodes coordinates and sets public var 'address'.
	// Error states set lat, long and address to 0,0,'' respectively.
	self.getAddress = function(){

		var deferred = $q.defer();

		if ($rootScope.DEV){
			self.address = '777 Debugger Ave, New York City';
			self.lat = 51.505;
			self.lng = -0.09;
			deferred.resolve(self.address); 
			return deferred.promise; 
		}

		// Get current pos
		$cordovaGeolocation.getCurrentPosition(posOptions)
		    .then(function (position) {
		    	
		    	self.enabled = true;

		    	// Check coords exist
		    	if (position.coords){
		    		self.lat  = position.coords.latitude;
      				self.lng = position.coords.longitude;
     
      				// Check Maps and vals ok
      				if (self.lng && self.lat && google.maps ){
      					
      					// Initialize maps
						var geocoder = new google.maps.Geocoder();
           				var latlng = new google.maps.LatLng(self.lat, self.lng );

           				// Reverse Geocode
           				geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                
			                if (status === google.maps.GeocoderStatus.OK) {
			                    
			                  // OK
			                  if (results[1]) {
			                    	MSLog('@GeoLocate: ' + JSON.stringify(results[1].formatted_address));
			                    	self.address = results[1].formatted_address.split(',').slice(0, -2).join(', '),
			                     	deferred.resolve(self.address);

			                  // No address
			                  } else {
			                    	self.address = '';
			                    	deferred.resolve('');
			                    	MSLog('@GeoLocate: failed: no maps results for position');
			                  }

			               // Geocoder call fail
			               } else {
			                	self.address = '';
			                 	deferred.resolve('');
			                	MSLog('@GeoLocate: failed: google.maps.geocode error: ' + status);
			               }
			            });
			        // Maps or vals bad    
           			} else {
           				self.address = '';
           				deferred.resolve('');
           				MSLog('@GeoLocate: failed: no position vals or no google.maps');
           			}	
           	    // No coordinates in position
      			} else {
      				self.address = '';
      				deferred.resolve('');
      				MSLog('@GeoLocate: failed: no $cordova.geolocation position object');
      			}    	

      		// $cordova layer failure	
		    }, function(err) {
		      self.address = '';
		      self.lat = 0;
		      self.lng = 0;
		      self.enabled = false;
		      deferred.resolve('');
		      MSLog('@GeoLocate: failed: $cordovaGeolocation error:' + JSON.stringify(err))
		    }
		);

		return deferred.promise;
	};

};
