angular.module('gitphaser').service('GeoLocate', GeoLocate);

/**
 * @ngdoc service
 * @module  gitphaser
 * @name  gitphaser.service:GeoLocate
 * @description  Provides geolocation, reverse geocoding, and map display
 */
function GeoLocate ($rootScope, $q, $cordovaGeolocation) {
  var icon, map;
  var self = this;

  // $cordovaGeolocation options
  var posOptions = {timeout: 60000, enableHighAccuracy: false};

  // Mapbox API
  var token = secure.mapbox.token;
  var id = secure.mapbox.id;

  // ----------------------------------------------- Properties -------------------------------------------
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.lat
   * @description User's current latitude (Float)
   */
  self.lat = null;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.lng
   * @description User's current longitude (Float)
   */
  self.lng = null;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.address
   * @description User's current location expressed as address (String)
   */
  self.address = null;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.enabled
   * @description Service state, determined by user authorizing geolocation on device (Boolean)
   */
  self.enabled = false;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.map
   * @description Leaflet map object
   */
  self.map = null;
  /**
   * @ngdoc service
   * @propertyOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.map
   * @description Leaflet marker object
   */
  self.marker = null;

  // ----------------------------------------------- Methods -------------------------------------------
  /**
   * @ngdoc service
   * @methodOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.isEnabled
   * @description Runs in the `nearby` route resolve block to trigger permissions, detect whether
   *              geolocation is enabled.
   */
  self.isEnabled = function () {
    var where = 'GeoLocate:isEnabled';
    var d = $q.defer();

    if ($rootScope.DEV) {
      d.resolve(true);
      return d.promise;
    }

    $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function (success) {
        self.enabled = true;
        logger(where, 'enabled');
        d.resolve(true);
      }, function (error) {
        self.enabled = false;
        logger(where, 'disabled');
        d.resolve(false);
      }
    );
    return d.promise;
  };

  /**
   * @ngdoc service
   * @methodOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.loadMap
   * @description Loads a Leaflet map with MapBox titles using devices current coordinate
   */
  self.loadMap = function () {
    self.getAddress().then(function () {
      self.map = L.map('map');
      self.map.setView([self.lat, self.lng], 16);
      L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: '',
          zoomControl: false,
          id: id,
          accessToken: token
        })
      .addTo(self.map);

      icon = L.icon.pulse({iconSize: [17, 17], color: '#387EF5'});
      self.marker = L.marker([self.lat, self.lng], {icon: icon}).addTo(self.map);
    });
  };

  /**
   * @ngdoc service
   * @methodOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.updateMap
   * @description Resets map view and marker to current device coordinates
   */
  self.updateMap = function () {
    self.getAddress().then(function () {
      self.map.setView([self.lat, self.lng], 16);
      self.marker.setLatLng([self.lat, self.lng]);
    });
  };

  /**
   * @ngdoc service
   * @methodOf gitphaser.service:GeoLocate
   * @name  gitphaser.service:GeoLocate.getAddress
   * @description Gets device coordinates and sets public vars 'lat', 'lng'.
   *              Reverse geocodes coordinates and sets public var 'address'.
   *              Error states set lat, long and address to 0,0,'' respectively.
   * @return {promise} Resolves either an address string or ''.
   */
  self.getAddress = function () {
    var where = 'GeoLocate:getAddress';
    var geocoder, latlng, d = $q.defer();

    if ($rootScope.DEV) {
      self.address = '777 Debugger Ave, New York City';
      self.lat = 51.505;
      self.lng = -0.09;
      d.resolve(self.address);
      return d.promise;
    }

    // Get current pos
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      self.enabled = true;
      self.address = '';

      // Check coords exist
      if (position.coords) {
        self.lat = position.coords.latitude;
        self.lng = position.coords.longitude;

        // Check Maps and vals ok
        if (self.lng && self.lat && google.maps) {
          // Initialize maps
          geocoder = new google.maps.Geocoder();
          latlng = new google.maps.LatLng(self.lat, self.lng);

          // Reverse Geocode
          geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              // OK
              if (results[1]) {
                logger(where, JSON.stringify(results[1].formatted_address));
                self.address = results[1].formatted_address.split(',').slice(0, -2).join(', ');
                d.resolve(self.address);

              // No address
              } else d.resolve(logger(where, 'no maps results for position'));
            // Geocoder call fail
            } else d.resolve(logger(where, 'google.maps.geocode error'));
          });
        // Maps or vals bad
        } else d.resolve(logger(where, 'no position vals or no google.maps'));
      // No coordinates in position
      } else d.resolve(logger(where, 'no $cordova.geolocation position object'));
    // $cordova layer failure
    }, function (err) {
      self.address = '794 Broadway, #2, Brooklyn NY';
      self.lat = 40.699927;
      self.lng = -73.940581;
      self.enabled = false;
      d.resolve(logger(where, JSON.stringify(err)));
    });

    return d.promise;
  };
}
