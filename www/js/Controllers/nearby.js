angular.module('gitphaser') 
  .controller('NearbyCtrl', NearbyCtrl);  

// @controller NearbyCtrl
// @params: $scope, $reactive
// @route: /tab/nearby
//
// Exposes Meteor mongo 'connections' to DOM, filtered against current user as 'transmitter'
// Subscription to 'connections' is handled in the route resolve. Also
// exposes GeoLocate service (for the maps view) and Notify service (to trigger notification when user
// clicks on list item to see profile)
function NearbyCtrl ($scope, $reactive, Notify, GeoLocate ){
  $reactive(this).attach($scope);
  
  var self = this;

  // Slide constants bound to the GeoLocate directive
  // and other DOM events, trigger updates based on 
  // whether we are looking at List || Map view. 
  self.listSlide = 0
  self.mapSlide = 1;
  self.slide = 0; 

  // Services
  self.geolocate = GeoLocate;
  self.notify = Notify;

  self.helpers({
      connections: function () {
        if (Meteor.userId())
          return Connections.find( {transmitter: Meteor.userId() } )
      }
  });
  

};
