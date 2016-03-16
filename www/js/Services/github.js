// @service: GitHub
// A service for interacting w/ the GitHub api
var gh_debug, gh_debugII, gh_debugIII;
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
   //
   // Configures user with Github.js API and
   // collects profile info
   self.getMe = function(){
      var where = "GitHub:getMe";
      var d = $q.defer();

       // Get API, then get current user profile, then get full account info.
      $github.getUser().then( function(user){
         user.show(null).then( function(info){   
            self.getAccount(info.login, user).then(function(account){
               
               self.api = user;
               self.me = account.info;
               self.repos = account.repos;
               self.events = account.events;
               d.resolve(true);

            }, function(e){ logger(where, e); d.reject(e)});
         }, function(e){ logger(where,e); d.reject(e)});
      }, function(e){ logger(where, e); d.reject(e)});

      return d.promise

   };

	// @function: getAccount
   // @param: username - a users github username
   // @return: promise
   // 
   // Gets GitHub profile, public repos and public events for
   // an arbitrary user
	self.getAccount = function(username, api){

      var where = "GitHub:getMe";
		var d = $q.defer();
      var account = {};

      // Get profile, then repos, then events
      api.show(username).then( function(info){
         api.userRepos(username).then( function(repos){
            api.userEvents(username).then(function(events){
                        
                  account.info = info;
                  account.repos = repos;
                  account.events = events;
                  d.resolve(account);
                  gh_debug = account;
               },
               function(e){ logger(where, e); d.reject(e);});
         }, function(e){ logger(where, e); d.reject(e); });
      }, function(e){ logger(where, e); d.reject(e); });  

      return d.promise;		
	}

   // DEVELOPMENT INIT;
   if ($rootScope.DEV){
      self.setAuthToken('4b6e119a5365ffdbe93f523a6a98bc8c2adf278f');
   };

};