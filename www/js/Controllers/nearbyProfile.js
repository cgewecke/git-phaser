angular.module('gitphaser')          
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)

// @controller: NearbyProfileCtrl
// @params: $scope, $stateParams
// @route: /tab/nearby/:userId
//
// For child view of nearby which shows profile of tapped nearby list item. 
// Locates/caches profile object stored as part of Meteor mongo connections record
// and populates the default profile template. 
function NearbyProfileCtrl ($scope, $stateParams, $state, GitHub, account ){
  
  var self = this;
    
  self.user = account.info;
  self.repos = account.repos;
  self.events = account.events;
  self.viewTitle = account.info.login;
  self.state = $state;
  self.nav = true;
  
  // Follow button init
  self.canFollow = GitHub.canFollow(account.info.login);

  // Back arrow
  self.back = function(){ 
      $state.go('tab.nearby') 
  }
  
  self.follow = function(){
  }

};