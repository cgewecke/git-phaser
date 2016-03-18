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
  this.events = GitHub.events;
  this.viewTitle = GitHub.me.login;
  this.canFollow = false;

  // @function: follow()
  //
  // Follows a user
  this.follow = function(){
  	this.canFollow = false;
  	// update the targets followers count
  	// update the users following count
  	// spinner
  	// ng-animate leave
  	// handle error
  };
  
};