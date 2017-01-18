angular.module('gitphaser').controller('NearbyController', NearbyCtrl);
/**
 * @ngdoc object
 * @module  gitphaser
 * @name  gitphaser.object:NearbyCtrl
 * @description  Controller for the `nearby` route. Exposes Meteor mongo 'connections' to DOM,
 *               filtered against current user as 'transmitter'. Subscription to 'connections'
 *               is handled in the route resolve. Also exposes GeoLocate service (for the maps view)
 *               and Notify service (to trigger notification when user clicks on list item to see profile)
 */
function NearbyCtrl ($scope, $reactive, Notify, GeoLocate) {
  $reactive(this).attach($scope);

  var self = this;

  /**
  * @ngdoc object
  * @propertyOf gitphaser.object:NearbyCtrl
  * @name  gitphaser.object:NearbyCtrl.listSlide
  * @description `Number`: Slide constant `0`. If slide === listSlide, the list view is shown.
  */
  self.listSlide = 0;
  /**
  * @ngdoc object
  * @propertyOf gitphaser.object:NearbyCtrl
  * @name  gitphaser.object:NearbyCtrl.mapSlide
  * @description `Number`: Slide constant `1`. If slide === mapSlide, the map view is shown.
  */
  self.mapSlide = 1;
  /**
  * @ngdoc object
  * @propertyOf gitphaser.object:NearbyCtrl
  * @name  gitphaser.object:NearbyCtrl.slide
  * @description `Number`: Slide variable. Set to `0` or `1` to show list/map view respectively
  */
  self.slide = 0;

  // Services
  self.geolocate = GeoLocate;
  self.notify = Notify;

  self.helpers({
    connections: function () {
      if (Meteor.userId()) {
        return Connections.find({transmitter: Meteor.userId() });
      }
    }
  });
}
