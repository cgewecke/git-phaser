// @service: Notify
// Handles push notification registry and does internal notifications management
angular.module('gitphaser')
  .service("Notify", Notify);

function Notify($q, $rootScope, GitHub, GeoLocate, $cordovaPushV5){
    
    var self = this;
    var error;

    // @function: initialize
    // @return: promise - (failures resolve, print to console)
    // Registers for push notifications when user is new or there has been a new app install.
    // It seems like the tokens are somehow linked to that - possibly through the device settings or 
    // something. Resolves in the nearby route.
    self.initialize = function(){

        var where = 'Notify:initialize';
        var deferred = $q.defer();

        // THIS WHOLE THING IS DISABLED PENDING FIX IN ISSUE #31 (cf. 'true')
        if($rootScope.DEV || !Meteor.user() || true ){ 
            deferred.resolve(); 
            return deferred.promise 
        };

        if (!Meteor.user().profile.pushToken || window.localStorage['pl_newInstall'] === 'true') {
    
            var iosConfig = {
                "sound": true,
                "alert": true,
            };
            
            $cordovaPushV5.register(iosConfig).then(function(deviceToken) {
         
                Meteor.users.update({ _id: Meteor.userId() }, {$set: {'profile.pushToken' : deviceToken}});
                window.localStorage['pl_newInstall'] = 'false';
                deferred.resolve();

            }, function(err) {
                logger(where, err);
                deferred.resolve();
            });
            
        } else {
            logger(where, 'already registered for APNS');
            deferred.resolve();
        }

        return deferred.promise;

    };

    // @function: sawProfile
    // @param: userId (a meteor userId)
    // Geolocates, generates a notification. 
    self.sawProfile = function(userId){
        
        if (!GitHub.me) return;

        GeoLocate.getAddress().then(function(location){
    
            var info = {
                target: userId,
                notification: {
                    type: 'sawProfile',
                    sender: Meteor.userId(),
                    pictureUrl: GitHub.me.pictureUrl,
                    name: GitHub.me.firstName + ' ' + GitHub.me.lastName,
                    profile: GitHub.me,
                    location: location, 
                    timestamp: new Date()
                }   
            };

            Meteor.call('notify', info);
        });     
    };

    // @function: checkedNotifications
    // Toggles flag server side to disable badge in notifications tab 
    self.checkedNotifications = function(){

        Meteor.call('resetNotifyCounter', null);
        return true;
    };

}