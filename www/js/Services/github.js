// @service: GitHub
// A service for interacting w/ the GitHub api
var gh_debug, gh_debugII;
angular.module('gitphaser')
  .service("GitHub", GitHub);


function GitHub($rootScope, $http, $q, $auth, $cordovaOauth, $ionicPlatform, $github){

   var self = this;

   // ------------------------------   PRIVATE  ------------------------------------
	
   // Keys
   var id = 'cc2cd9f335b94412c764';
   var secret = '1f4838b6f17c07b6d91761930a2f484adc25762f';
   var perm = [];
   var state = "u79z234c06nq";

   // PRODUCTION 
   var authToken = null;

   // ------------------------------   PUBLIC ------------------------------------
	
   // Init
   self.me = null; // The user profile;
   self.repos = null; // The user's public repos;
   self.api = null; // GitHub.js api 
	
	// @function: setAuthToken: 
   // @param: token
   // Convenience method to set authToken when app is already authenticated from previous use.
	self.setAuthToken = function(token){
      authToken = token;
		$github.setOauthCreds(token);
	}

   // @function: getAuthToken: 
   // Convenience method to get authToken when it needs to be saved in user account, etc
   self.getAuthToken = function(){
      if (authToken) 
         return authToken;
    
      return null;
   }

   // @function: initialize
   // Invoked in the routing resolve at tab/nearby - if user autologs into Meteor,
   // we still need to fetch a fresh GitHub profile for them. Only initializes
   // if self.me doesn't exist yet.
   self.initialize = function(){

      var where = 'GitHub:initialize';
      var d = $q.defer();

      if (!self.me){
         $auth.requireUser().then(

            function(userLoggedIn){

               self.setAuthToken(Meteor.user().profile.authToken);          
               self.getMe().then(

                  function(success){
                     d.resolve(true);
                  }, 
                  function(error){
                     logger(where, error);
                     d.reject('AUTH_REQUIRED');
                  });
            }, 
            function(userLoggedOut){
               logger(where, userLoggedOut);
               d.reject('AUTH_REQUIRED');
            });

      } else {
         d.resolve(true);
      }

      return d.promise;
   }

	// @function: authenticate: 
  // @return: promise (rejects if $cordovaOauth fails)
  // Logs user into GitHub via inAppBroswer. sets authToken
	self.authenticate = function(){
      var token, deferred, uri;
      var where = 'GitHub:authenticate';

		deferred = $q.defer();
      uri = 'http://cyclop.se/help';
		
      $ionicPlatform.ready(function() {

         $cordovaOauth.github(id, secret, perm, {redirect_uri: uri}).then(

            function(result) {

               token = result.split('&')[0].split('=')[1];
               self.setAuthToken(token);

               logger(where, authToken);
           		deferred.resolve();
         	}, 
            function(error) {
               logger(where, error);
               deferred.reject(error);
            });
      });

		return deferred.promise;	
	}

	// @function: getMe
   // @return: promise 
   // GitHub API call to get the user profile. Resolves self.me.
	self.getMe = function(){

      var where = "GitHub:getMe";
		var deferred = $q.defer();
		
      // Get API for user object
      $github.getUser().then(

         function(user){

            self.api = user;

            // Get user profile
            self.api.show(null).then(
               
               function(info){
                  self.me = info;
                  gh_debug = info;
                  
                  // Get repos list
                  self.api.repos({visibility: 'public', sort: 'updated'}).then(

                     function(repos){
                        self.repos = repos;
                        deferred.resolve(true);
                        gh_debugII = repos;
                     },

                     function(error){
                        logger(where, error);
                        deferred.reject(error);
                     });
               },
               function(error){
                  logger(where, error);
                  deferred.reject(error);
               });
         }, 
         function(error){
            logger(where, error);
            deferred.reject(error);
         });
    
      return deferred.promise;		
	}

   // DEVELOPMENT INIT;
   if ($rootScope.DEV){
      self.setAuthToken('4b6e119a5365ffdbe93f523a6a98bc8c2adf278f');
   };

};