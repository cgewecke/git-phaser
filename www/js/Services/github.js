// @service: GitHub
// A service for interacting w/ the GitHub api

angular.module('gitphaser')
  .service("GitHub", GitHub);


function GitHub($rootScope, $http, $q, $auth, $cordovaOauth, $ionicPlatform, Beacons){

	var self = this;

	// ------------------------------   PRIVATE  ------------------------------------
	
	// GitHub profile data api call
  var options = ":(id,num-connections,picture-url,first-name,last-name,headline,location,industry,specialties,positions,summary,email-address,public-profile-url)";
  var protocol = "?callback=JSON_CALLBACK&format=jsonp&oauth2_access_token="
  var me_root = "https://api.GitHub.com/v1/people/~";
  var other_root = null;

  // Keys
  var id = 'cc2cd9f335b94412c764';
  var secret = '1f4838b6f17c07b6d91761930a2f484adc25762f';
  var perm = [];
  var state = "u79z234c06nq";

  // PRODUCTION 
  var authToken = null;

  // DEVELOPMENT
  if ($rootScope.DEV){
    var authToken = "4b6e119a5365ffdbe93f523a6a98bc8c2adf278f";
  };

  // ------------------------------   PUBLIC ------------------------------------
	
  self.me = null;
	
	// @function: setAuthToken: 
  // @param: token
  // Convenience method to set authToken when app is already authenticated from previous use.
	self.setAuthToken = function(token){
		authToken = token;
	}

  // @function: initialize
  // Invoked in the routing resolve at tab/nearby - if user autologs into Meteor,
  // we still need to fetch a fresh GitHub profile for them. Only initializes
  // if self.me doesn't exist yet.
  self.initialize = function(){

    var d = $q.defer();

    if (!self.me){
      $auth.requireUser().then(

        function(userLoggedIn){

          self.setAuthToken(Meteor.user().profile.authToken);
          self.getMe().then(function(success){

            MSLog('@GitHub:initialize: autologged in');
            d.resolve(true);
          }, function(error){
            MSLog('@GitHub:initialize. Failed: couldnt get profile')
            d.reject('AUTH_REQUIRED');
          }); 
        }, 
        function(userLoggedOut){
          MSLog('@GitHub:initialize: Failed: requireUser: ' + userLoggedOut);
          d.reject('AUTH_REQUIRED');
        }
      );
    } else {
      d.resolve(true);
    }

    return d.promise;
  }

	// @function: authenticate: 
  // @return: promise (rejects if $cordovaOauth fails)
  // Logs user into GitHub via inAppBroswer. sets authToken
	self.authenticate = function(){
		var deferred = $q.defer();
		$ionicPlatform.ready(function() {

      $cordovaOauth.github(id, secret, perm, {redirect_uri: "http://cyclop.se/help"}).then(
        function(result) {
            console.log('GITHUB RESULT: ' + JSON.stringify(result));
      
            authToken = result.split('&')[0].split('=')[1];
        		deferred.resolve();
            MSLog('@GitHub:authenticate: authToken = ' + authToken);

      	}, function(error) {
            deferred.reject(error);
        });
    });

		return deferred.promise;	
	}

	// @function: getMe
  // @return: promise 
  // GitHub API call to get the user profile. Resolves self.me.
	self.getMe = function(){
		
		var deferred = $q.defer();
		var url = me_root + options + protocol + authToken;

		$http.jsonp(url)
      .success(function(result) {

      	 self.me = result;
      	 self.me.name = result.firstName + " " + result.lastName;
         self.me.authToken = authToken;
      	 deferred.resolve(self.me);
      })
      .error(function(error){
      	 deferred.reject(error);
      });

    return deferred.promise;		

	}

};