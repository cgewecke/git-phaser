angular.module('gitphaser')
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