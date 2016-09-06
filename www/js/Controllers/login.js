angular.module('gitphaser').controller("LoginCtrl", LoginCtrl);
/**
 * @ngdoc object
 * @module  gitphaser
 * @name  gitphaser.object:LoginCtrl
 * @description  Controller for the `login` route. Functions/Methods for a two-step login process 
 *               which signs user into GitHub and then Meteor using details from a GitHub profile
 */
function LoginCtrl ($rootScope, $scope, $auth, $state, $reactive, $cordovaKeychain, GitHub, Beacons, ionicToast, $timeout ){
        
    $scope.DEV = $rootScope.DEV;
    $scope.loggingIn = false; // Dom flag for spinner that appears when returning from inAppBrowser login
    
    var toastMessage = "Couldn't get your GitHub profile. Try again.";
    var keychain = $cordovaKeychain;
    
    // ------------------------------------ Public -------------------------------------------    
    /**
     * @ngdoc method
     * @methodOf gitphaser.object:LoginCtrl
     * @name  gitphaser.object:LoginCtrl.login
     * @description Authenticates with GitHub, loads GitHub profile and passes to meteor login handlers. 
     *              Shows toast on authentication failure.  
     */
    $scope.login = function(){
        var where = 'LoginCtrl:login';
        
        $scope.loggingIn = true;

        GitHub.authenticate()
            .then(GitHub.getMe)
            .then(meteorLogin)
            .catch(function(error){
                $scope.loggingIn = false;
                ionicToast.show(toastMessage, 'top', true, 2500);
                logger(where, error);
            });
    };

    /**
     * @ngdoc method
     * @methodOf gitphaser.object:LoginCtrl
     * @name  gitphaser.object:LoginCtrl.devLogin
     * @description Bypasses authentication call which cannot run in browser because cordova
     *              inAppBrowser is device/simulator only
     */
    $scope.devLogin = function(){
        logger('LoginCtrl:devLogin', '');
        GitHub.devInitialize();
        GitHub.getMe().then(meteorLogin);
    };

    // ------------------------------------ Utilities -------------------------------------------
    /**
     * Generates user object stub, then checks Meteor to see if account exists. 
     * Logs in w/password or creates based on result
     */
    function meteorLogin(){
        logger('LoginCtrl:meteorLogin', '');
        
        // User object
        var user = {
            username: GitHub.me.login,
            email: null,
            profile: {
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

        // Get password and authToken from keychain
        $q.all([ 
            getPassword(GitHub.me.login),
            GitHub.getAuthToken(GitHub.me.login)
        ]).then(function(vals){
            user.password = vals[0];
            user.profile.authToken = vals[1];

            // Check registration
            Meteor.call('hasRegistered', user.username, function(err, registered ){
                var where = 'LoginCtrl:hasRegistered';
                
                if (err){
                    $scope.loggingIn = false;
                    logger(where, err);

                } else {
                    (registered)  
                        ? loginWithAccount(user)  
                        : createAccount(user); 
                } 
            })
        })

                       
    }
    /**
     * Update our user w/current GitHub profile. Set pl_id in local storage to user email. 
     * This variable will be accessed by the beacon delegate and used to self-identify 
     * with server when woken up in the background.  Redirect to setup if app is a new install, 
     * nearby otherwise.
     * @param  {Object} user Account object
     */
    function loginWithAccount(user){
        logger('LoginCtrl:loginWithAccount', '');

        Meteor.loginWithPassword(user.username, user.password, function(err){
            if (!err){
                
                $auth.waitForUser().then(function(){

                    window.localStorage['pl_id'] = Meteor.user().emails[0].address;
                
                    if (!window.localStorage['pl_newInstall']){
                        window.localStorage['pl_newInstall'] = 'true';
                        $state.go('setup'); 
                    } else {
                        $state.go('tab.nearby');
                    }

                    // Delay turning spinner off - statechange sometimes takes a while because
                    // nearby route has tons to resolve
                    $timeout(function(){ $scope.loggingIn = false }, 3000);
                })
            
            } else {
                $scope.loggingIn = false;
                ionicToast.show("Couldn't login to git-phaser. (Password) Try again.", 'top', true, 2500);
            }
        });
    };
    /**
     * Gets next beacon major/minor for this app instance, creates user and saves
     * email string composed of uuid, beacon major and minor on server and in local storage.  
     * Redirect to setup or kick back to login if there is an error. This could happen
     * if two apps simultaneously create accounts and generate the same email
     * address. Email field is being used because its guaranteed to be unique.
     * @param  {object} user Account object
     */
    function createAccount(user){

        var where = 'LoginCtrl:createAccount';
        var toastMessage = "There was a problem creating an account. Try Again";
        
        Meteor.call( 'getUniqueAppId', function(err, val){ 
            if (!err && val ){

                var i = val.minor % Beacons.quantity; // Index to select uuid

                user.profile.appId = Beacons.getUUID(i);
                user.profile.beaconName = 'r_' + i;
                user.profile.major = val.major;
                user.profile.minor = val.minor;
                user.email = val.major + '_' + val.minor + '_' + user.profile.appId;
        
                Accounts.createUser(user, function(err){
                    if (!err){

                        window.localStorage['pl_id'] = user.email;
                        window.localStorage['pl_newInstall'] = 'true';
                        $state.go('setup');
                        $timeout(function(){ $scope.loggingIn = false }, 3000);
                        
                    } else{
                        $scope.loggingIn = false;
                        logger(where, err);
                        ionicToast.show(toastMessage, 'top', true, 2500);
                    }
                })

            } else{
                $scope.loggingIn = false;
                logger(where, err);
                ionicToast.show(toastMessage, 'top', true, 2500);
            }
        });
    };

    /**
     * Gets (or generates/sets/gets ) a random alpha-numeric password to access the git-phaser
     * server. In development this key is saved in local storage, in production it's saved in the
     * device keychain.
     * @param  {String} username Github.info.login
     * @return {String}          A pseudo-randomly generated string
     */
    function getPassword(username){
        var key = 'gppw_' + username;
        
        if ($rootscope.DEV){
            if (!window.localStorage[key])
                window.localStorage[key] = generatePassword();
                
            return $q.when(window.localStorage[key]);

        } else {
            return keychain.getForKey('gitphaser', key)
                .catch( function(){ keychain.setForKey('gitphaser', key, generatePassword())})
                .finally(function(){ return keychain.getForKey('gitphaser', key)})
        }
    };

    /**
     * Generates a password for client to access git-phaser server.
     * @return {String} pseudo randomly generated password.
     */
    function generatePassword(){
        return Math.random().toString(36).substring(7);
    }
};