angular.module('gitphaser')          
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)

// @controller: NearbyProfileCtrl
// @params: $scope, $stateParams
// @route: /tab/nearby/:userId
//
// For child view of nearby which shows profile of tapped nearby list item. 
// Locates/caches profile object stored as part of Meteor mongo connections record
// and populates the default profile template. 
function NearbyProfileCtrl ($scope, $reactive, $stateParams ){
  $reactive(this).attach($scope);

  var self = this;
  
  // DB: Connections, get profile
  this.subscribe('connections');

  this.helpers({
    connection: function () {
      return Connections.findOne({'profile.id': $stateParams.userId});
    }
  });

  $scope.connection = self.connection;

  $scope.$watch('connection', function(newVal, oldVal){
    if (newVal){
      self.user = self.connection.profile;
      self.user.name = self.user.firstName + ' ' + self.user.lastName;
      self.viewTitle = self.user.name;
    }
  });

  /* Template vars
  self.user = self.connection.profile;
  self.user.name = self.user.firstName + ' ' + self.user.lastName;
  self.viewTitle = self.user.name;*/
  
};