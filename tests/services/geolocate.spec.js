"use strict"
var gl_debug;

// Global Google variable mock for object we get over http at index.html
var google;

describe('Service: GeoLocate', function () {
    
    beforeEach(module('linkedin'));    // Application
    beforeEach(module('mocks'));  // Mocked Meteor services, collections

    // Disable Ionic templating
    beforeEach(module(function($provide, $urlRouterProvider) {  
        $provide.value('$ionicTemplateCache', function(){} );
        $urlRouterProvider.deferIntercept();
    }));

    var $scope, $q, $cordovaGeolocation, $compile,
        GeoLocate, defer;

    beforeEach(inject(function(_$rootScope_, _$q_, _$cordovaGeolocation_, _$compile_, _GeoLocate_ ){
        
        $scope = _$rootScope_;
        $cordovaGeolocation = _$cordovaGeolocation_;
        $q = _$q_;
        $compile = _$compile_;
        GeoLocate = _GeoLocate_;

        defer = $q.defer();

        //$cordovaGeoLocation mocks
        $cordovaGeolocation.getCurrentPosition = function(options){return defer.promise };

    }));

    it('should initialize correctly', function(){
        expect(GeoLocate.lat).toBe(null);
        expect(GeoLocate.lng).toBe(null);
        expect(GeoLocate.address).toBe(null);
        expect(GeoLocate.enabled).toBe(false);
        expect(GeoLocate.map).toBe(null); 
        expect(GeoLocate.marker).toBe(null);   
    });

    describe('loadMap()', function(){

        it('should initialize a map object and attach it to the DOM', function(){

            // Initialize Map
            var map = angular.element('<beacon-map></beacon-map>');
            $compile(map)($scope);
            angular.element(document.body).append(map);
            $scope.$digest();

            // Setup
            defer.reject();
            GeoLocate.map = null;
            spyOn(GeoLocate, 'getAddress').and.callThrough();
            
            GeoLocate.loadMap();

            // Test
            $scope.$digest();
            expect(GeoLocate.map).not.toBe(null);
            expect(map.find('div#map').hasClass('leaflet-container')).toBe(true);

            //Cleanup
            GeoLocate.map.remove();
            var node  = document.getElementById("map");
            node.parentNode.removeChild(node);
            $scope.$digest();

        });

    });

    describe('updateMap()', function(){

        it('should update the map with current lat/lng', function(){

            // Initialize Map 
            var map = angular.element('<beacon-map></beacon-map>');
            $compile(map)($scope);
            angular.element(document.body).append(map);
            $scope.$digest();

            // Setup
            defer.reject();
            GeoLocate.map = null;
            spyOn(GeoLocate, 'getAddress').and.callThrough();
            

            // Execute
            GeoLocate.loadMap();
            $scope.$digest();

            spyOn(GeoLocate.map, 'setView');
            spyOn(GeoLocate.marker, 'setLatLng');
           
            GeoLocate.updateMap();
            $scope.$digest();

            //Test
            expect(GeoLocate.map.setView).toHaveBeenCalledWith([0,0],16);
            expect(GeoLocate.marker.setLatLng).toHaveBeenCalledWith([0,0]);

            //Cleanup
            GeoLocate.map.remove();
            var node  = document.getElementById("map");
            node.parentNode.removeChild(node);
            $scope.$digest();
         })   

    });

    describe('getAddress()', function(){

        var mock_position, mock_results, mock_status;
        
        // Maps/Position mock;
        mock_position = { coords: { latitude: 50, longitude: 50 } };
        mock_results = [ {}, {formatted_address: 'XXX,AAA,000,333,777' }];
        mock_status = true;

        google = {
            maps: { 
                Geocoder: function() {
                    this.geocode = function(obj, fn){
                        fn.call(this, mock_results, mock_status); 
                    }
                },
                LatLng: function(lat, lng){ return this; },
                GeocoderStatus: { OK: true }
            }
        };

        it('should resolve an address on success', function(){

            var q;
            var expected = mock_results[1].formatted_address.split(',').slice(0, -2).join(', ');

            defer.resolve(mock_position);
            spyOn($cordovaGeolocation, 'getCurrentPosition').and.callThrough();
            
            q = GeoLocate.getAddress();
            $scope.$digest();
            
            expect(GeoLocate.address).toEqual(expected);

        });
    });
});