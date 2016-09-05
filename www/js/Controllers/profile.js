angular.module('gitphaser').controller('ProfileCtrl', ProfileCtrl)
/**
 * @ngdoc object
 * @module  gitphaser
 * @name  gitphaser.object:ProfileCtrl
 * @description  Exposes GitHub.me profile object or account object to the profile template.
 *               Governs the `/tab/profile` and `others/:username` routes. 
 */
function ProfileCtrl ($scope, $stateParams, $state, GitHub, account){
  
	var self = this;

	/**
     * @ngdoc object
     * @propertyOf gitphaser.object:ProfileCtrl
     * @name  gitphaser..object:ProfileCtrl.modalOpen
     * @description `Boolean`: Triggers appearance changes in the template when 
     *              a contact modal opens. See 'contact' directive.
     */
	self.modalOpen = false;

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

	/**
     * @ngdoc method
     * @methodOf gitphaser.object:ProfileCtrl
     * @name  gitphaser.object:ProfileCtrl.back
     * @description Navigates back to `$stateParams.origin`. For nav back arrow visible in the `others`
     *              route.
     */
	self.back = function(){  
        if ($stateParams.origin === 'nearby')        $state.go('tab.nearby');
        if ($stateParams.origin === 'notifications') $state.go('tab.notifications') 
    };

	/**
     * @ngdoc method
     * @methodOf gitphaser.object:ProfileCtrl
     * @name  gitphaser.object:ProfileCtrl.follow
     * @description Wraps `GitHub.follow` and hides the follow button when clicked.
     */
	self.follow = function(){
		self.canFollow = false;
		GitHub.follow(self.user);
	}

};