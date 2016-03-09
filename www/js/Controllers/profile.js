angular.module('gitphaser')
  .controller('ProfileCtrl', ProfileCtrl)

// @controller: ProfileCtrl
// @params: $scope, GitHub
// @route: /tab/profile
//
// Exposes GitHub.me profile object to default profile template
function ProfileCtrl ($scope, GitHub){
    
  this.user = GitHub.me;
  this.user.name = this.user.firstName + ' ' + this.user.lastName;
  this.viewTitle = "You";
  
};