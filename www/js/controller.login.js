// @controller: LoginCtrl
// @route: /login
//
// Functions/Methods for a two-step login process which signs into LinkedIn and then
// Meteor using details from a LinkedIn profile
angular.module('linkedin')
  .controller("LoginCtrl", LoginCtrl);


function LoginCtrl ($rootScope, $scope, $auth, $state, $reactive, LinkedIn, Beacons, ionicToast, $timeout ){
    
    $scope.DEV = $rootScope.DEV;

    var appHash = "Txc9"; // Constant to help generate password  
    var toastMessage = "Couldn't get your LinkedIn profile. Try again.";
    
    $scope.loggingIn = false; // Dom flag for spinner that appears when returning from inAppBrowser login

    // ------------------------------------ PUBLIC -------------------------------------------
    // @function: Login
    // Authenticates with LinkedIn, loads linkedin profile and passes to meteor login handlers. 
    // Shows toast on authentication failure.
    $scope.login = function(){
      MSLog('@login');
      
      $scope.loggingIn = true;
      LinkedIn.authenticate().then(function(){
  
        LinkedIn.getMe().then(function(){
          meteorLogin();
        },
        function(error){
          $scope.loggingIn = false;
          ionicToast.show(toastMessage, 'top', true, 2500);
          MSLog('Linkedin data api failed: ' + error)
        });

      }, function(error){
        $scope.loggingIn = false;
        ionicToast.show(toastMessage, 'top', true, 2500);
        MSLog('Linkedin login failed: ' + JSON.stringify(error));

      });
    };

    // @function: devLogin
    // DEVELOPMENT ONLY: Bypasses authentication call which cannot run in browser because cordova
    // inAppBrowser is device/simulator only
    $scope.devLogin = function(){
      MSLog('@devLogin');
      
      LinkedIn.getMe().then(function(){
        meteorLogin();
      });
    };

    // ------------------------------------ PRIVATE -------------------------------------------
    // @function: meteorLogin 
    // Generates user object stub, then checks Meteor to see if account exists. 
    // Logs in w/password or creates based on result
    function meteorLogin(){
      MSLog('@meteorLogin')
      
      // User object
      var user = {
        username: LinkedIn.me.id,
        password: LinkedIn.me.id + '_' + appHash,
        email: null,
        profile: {
          authToken: LinkedIn.me.authToken,
          profileUrl: LinkedIn.me.publicProfileUrl,
          notifications: [],
          contacts: [],
          notifyCount: 0,
          pushToken: null,
          major: null,
          minor: null,
          appId: null,
          session: null
        }
      };

      // Check registration
      Meteor.call('hasRegistered', user.username, function(err, registered ){
        
        if (!err){

          (registered) ? 
            loginWithAccount(user) : 
            createAccount(user); 
        
        } else {
          $scope.loggingIn = false;
          MSLog('Registration error');
        }
      })            
      
    }

    // @function: loginWithAccount
    // Update our user w/current linkedIn profile
    // Set pl_id in local storage to user email. This variable will be accessed by
    // the beacon delegate and used to self-identify with server when woken up in the
    // background.  Redirect to setup if app is a new install, nearby otherwise.
    function loginWithAccount(user){
      MSLog('@loginWithAccount');

      Meteor.loginWithPassword(user.username, user.password, function(err){
        if (!err){
          
          $auth.waitForUser().then(function(){
  
            window.localStorage['pl_id'] = Meteor.user().emails[0].address;
            Meteor.users.update(Meteor.userId(), { $set: { 'profile.authToken': user.profile.authToken } });
            
            if (!window.localStorage['pl_newInstall']){
              window.localStorage['pl_newInstall'] = 'true';
              $state.go('setup'); 
            } else {
              $state.go('tab.nearby');
            }

            // Delay turning spinner off - statechange sometimes takes a while because
            // nearby route has tons to resolve
            $timeout(function(){
              $scope.loggingIn = false;
            }, 3000);
          })
        
        } else {
          $scope.loggingIn = false;
          ionicToast.show("Couldn't log in to Psychic Link. (Password) Try again.", 'top', true, 2500);
        }
      });
    };

    // @function: createAccount
    // Get next beacon major/minor for this app instance, create user and save
    // email string composed of uuid, beacon major and minor there and in local storage.  
    // Redirect to setup or kick back to login if there is an error. This could happen
    // if for some reason two app simultaneously create accounts and generate the same email
    // address. Email is guaranteed to be unique.
    function createAccount(user){
      var toastMessage = "There was a problem creating an account. Try Again";

      Meteor.call( 'getUniqueAppId', function(err, val){ 
        if (!err && val ){

          var i = val.minor % Beacons.quantity; // Index to select uuid

          user.profile.appId = Beacons.getUUID(i);
          user.profile.beaconName = 'r_' + i;
          user.profile.major = val.major;
          user.profile.minor = val.minor;

          user.email = val.major + '_' + val.minor + '_' + user.profile.appId;
          
          MSLog("new account: " + user.email + ': ' + user.profile.profileUrl);

          Accounts.createUser(user, function(err){
            if (!err){
  
              window.localStorage['pl_id'] = user.email;
              window.localStorage['pl_newInstall'] = 'true';
              $state.go('setup');

              $timeout(function(){
                $scope.loggingIn = false;
              }, 3000);
              
            } else{
              $scope.loggingIn = false;
              MSLog("@LoginCtrl: Accounts.createUser failed: " + err);
              ionicToast.show(toastMessage, 'top', true, 2500);
            }
          })

        } else{
          $scope.loggingIn = false;
          MSLog("@LoginCtrl: getUniqueAppId failed: " + err);
          ionicToast.show(toastMessage, 'top', true, 2500);
        }
      });
    };
};