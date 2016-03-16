angular.module('gitphaser')
  .controller('ProfileCtrl', ProfileCtrl)

// @controller: ProfileCtrl
// @params: $scope, GitHub
// @route: /tab/profile
//
// Exposes GitHub.me profile object to default profile template
function ProfileCtrl ($scope, GitHub){
    
  this.user = GitHub.me;
  this.repos = GitHub.repos;
  this.activity = GitHub.activity;
  this.viewTitle = GitHub.me.login;
  
};