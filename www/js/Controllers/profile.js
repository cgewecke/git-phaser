angular.module('linkedin')
  .controller('ProfileCtrl', ProfileCtrl)

// @controller: ProfileCtrl
// @params: $scope, LinkedIn
// @route: /tab/profile
//
// Exposes LinkedIn.me profile object to default profile template
function ProfileCtrl ($scope, LinkedIn){
    
  this.user = LinkedIn.me;
  this.user.name = this.user.firstName + ' ' + this.user.lastName;
  this.viewTitle = "You";
  
};