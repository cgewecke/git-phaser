angular.module('gitphaser').directive("beaconMap", BeaconMap);

/**
 * @ngdoc directive
 * @name  beaconMap
 * @module  gitphaser
 *
 * @description 
 * `<beacon-map>` wraps a MapBox map that shows the user's current
 *     location. Loads or updates the map when the map slide is selected.
 *      
 * @param {number=} slide The current slide value. If slide's val is '1',
 *      the map is either initialized or updated. 
 */
function BeaconMap(GeoLocate){
    return {
        restrict: 'E',   
        scope: {slide: '=slide'},
        template: '<div id="map"></div>',
        link: function searchboxEventHandlers(scope, elem, attrs){

            // Unit Testing exposure
            scope.GeoLocate = GeoLocate;

            // Map must be a fixed size, so expand for IPad
            (ionic.Platform.isIPad()) 
                ? elem.addClass('ipad') 
                : null;
                
            // Load or update map when slide view is toggled to map 
            scope.$watch('slide', function(newVal, oldVal){

                if (newVal === 1){
                    (GeoLocate.map === null) 
                        ? GeoLocate.loadMap() 
                        : GeoLocate.updateMap();
                };
            });
        }
    };
};