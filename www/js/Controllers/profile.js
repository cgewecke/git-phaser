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
  this.nav = false;

  // Show order logic: There are four optional profile info fields
  // and two spaces to show them in. In order of importance:
  // 1. Company
  // 2. Blog
  // 3. Email
  // 4. Location
  this.company = this.user.company;
  this.email = this.user.email;
  this.blog = this.user.blog;
  this.location = this.user.location;

  // Case: both exist - no space
  if (this.company && this.email){
  
  	this.blog = false;
  	this.location = false;
  
  // Case: One exists - one space, pick blog, or location
  } else if ( (!this.company && this.email) || (this.company && !this.email) ){

	(this.blog) ? this.location = false : true;

  } 
  
};