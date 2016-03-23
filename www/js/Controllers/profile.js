angular.module('gitphaser')
  .controller('ProfileCtrl', ProfileCtrl)

// @controller: ProfileCtrl
// @params: $scope, GitHub
// @routes: /tab/profile
//          others/:username
//
// Exposes GitHub.me profile object or account object to the profile template
function ProfileCtrl ($scope, $stateParams, $state, GitHub, account){
  
   var self = this;

   // Arbitrary profile
   if (account){

      self.user = account.info;
      self.repos = account.repos;
      self.events = account.events;
      self.viewTitle = account.info.login;
      self.state = $state;
      self.nav = true;
      self.canFollow = GitHub.canFollow(account.info.login);

  // The user's own profile
   } else {

      self.user = GitHub.me;
      self.repos = GitHub.repos;
      self.events = GitHub.events;
      self.viewTitle = GitHub.me.login;
      self.canFollow = false;
      self.nav = false;
   }
  
   // Info logic: There are four optional profile fields
   // and two spaces to show them in. In order of importance:
   // 1. Company, 2. Blog, 3. Email, 4. Location
   self.company = self.user.company;
   self.email = self.user.email;
   self.blog = self.user.blog;
   self.location = self.user.location;

   // Case: both exist - no space
   if (self.company && self.email){

      self.blog = false;
      self.location = false;

   // Case: One exists - one space, pick blog, or location
   } else if ( (!self.company && self.email) || (self.company && !self.email) ){

      (self.blog) ? self.location = false : true;

   } 

   // @function: back 
   // Navigates to tab.nearby - for nav back arrow visible in the
   // others/ route use of this template
   self.back = function(){ 
      $state.go('tab.nearby') 
   }

   // @function: follow 
   // Wraps GitHub.follow - hides follow button when clicked
   self.follow = function(){
      this.canFollow = false;
      GitHub.follow(self.user);
   }

};