angular.module('gitphaser')
    .controller('SettingsCtrl', SettingsCtrl);

// @controller: SettingsCtrl
// @params: $scope, $state, GeoLocate, Notify, ionicToast
// @route: /settings
//
// Attempts to display current app permissions. Currently used for some useful
// developer testing functions, like clearing notifications etc. 
function SettingsCtrl($scope, $state, $reactive, GeoLocate, Notify, GitHub, ionicToast) {
    $reactive(this).attach($scope);

    var message = "Go to Settings > Git-Phaser in your device's settings menu to change this."
    var penelope = "1_29_05DEE885-E723-438F-B733-409E4DBFA694";
    var user1, user2, user3; // Fake users.

    this.geolocate = {enabled: true};
    this.notify = {enabled: true};

    this.logout = function() {
            $state.go('login');
    };
    
    this.toast = function(){
        ionicToast.show(message, 'middle', true, 2500);
    }

    // ------------------ -----  TESTING ----------------------------------
    
    user1 = {
        username: 'alexanderGugel',
        email: "0_0_4F7C5946-87BB-4C50-8051-D503CEBA2F19",
        password: 'hello',
        profile: {
            beaconName: 'r_0',
            notifications: [],
            contacts: [],
            notifyCount: 0,
            pushToken: null,
            major: 0,
            minor: 0,
            appId: "4F7C5946-87BB-4C50-8051-D503CEBA2F19",
            session: null
        }
    };

    user2 = {
        username: 'michael',
        email: "0_0_D4FB5D93-B1EF-42CE-8C08-CF11685714EB",
        password: 'hello',
        profile: {
            beaconName: 'r_1',
            notifications: [],
            contacts: [],
            notifyCount: 0,
            pushToken: null,
            major: 0,
            minor: 0,
            appId: "D4FB5D93-B1EF-42CE-8C08-CF11685714EB",
            session: null
        }
    };

    user3 = {
        username: 'lyzadanger',
        email: "0_1_458735FA-E270-4746-B73E-E0C88EA6BEE0",
        password: 'hello',
        profile: {
            beaconName: 'r_4',
            notifications: [],
            contacts: [],
            notifyCount: 0,
            pushToken: null,
            major: 0,
            minor: 0,
            appId: "458735FA-E270-4746-B73E-E0C88EA6BEE0",
            session: null
        }
    };

    this.addUsers = function(){
        Accounts.createUser(user1);
        Accounts.createUser(user2);
        Accounts.createUser(user3);
    }

    this.pubUsers = function(){

        var pkg1 = {
            transmitter: Meteor.user().emails[0].address,
            receiver: user1.email,
            proximity: 'ProximityNear'
        };

        var pkg2 = {
            transmitter: Meteor.user().emails[0].address,
            receiver: user2.email,
            proximity: 'ProximityFar'
        };

        var pkg3 = {
            transmitter: Meteor.user().emails[0].address,
            receiver: user3.email,
            proximity: 'ProximityImmediate'
        };

        Meteor.call('newConnection', pkg1, function(err, connections){});
        Meteor.call('newConnection', pkg2, function(err, connections){});
        Meteor.call('newConnection', pkg3, function(err, connections){});
    };

    this.clearUsers = function(){
        var pkg1 = {
            transmitter: Meteor.user().profile.appId,
            receiver: user1.email
        };

        var pkg2 = {
            transmitter: Meteor.user().profile.appId,
            receiver: user2.email
        };

        var pkg3 = {
            transmitter: Meteor.user().profile.appId,
            receiver: user3.email
        };

        Meteor.call('disconnect', pkg1);
        Meteor.call('disconnect', pkg2);
        Meteor.call('disconnect', pkg3);
    }

    // Add penelope
    this.testPub = function(){

        var pkg = {
            transmitter: Meteor.user().emails[0].address,
            receiver: penelope,
            proximity: Math.random().toString()
        }
        Meteor.call('newConnection', pkg, function(err, connections){})
    };

    // Remove Penelope
    this.clearPub = function(){
        
        var pkg = {
            transmitter: Meteor.user().profile.appId,
            receiver: penelope
        }
        Meteor.call('disconnect', pkg, function(err, result){
            (err) ? console.log(JSON.stringify(err)) : console.log(JSON.stringify(result)); 
        })
    }

    // Clears all notifications from current user
    this.clearNotes = function(){
        Meteor.users.update({_id: Meteor.userId()}, 
            {$set: 
                {'profile.notifications' : [],
                 'profile.notifyCount' : 0
                }
            }
        );
    };

    this.testChangeProximity = function(){
        var pkg = {
            transmitter: Meteor.user().emails[0].address,
            receiver: Meteor.user().emails[0].address,
            proximity: Math.random().toString()
        }

        Connections.update({transmitter: pkg.transmitter}, {$set: {proximity: pkg.proximity}});

    };

    // Emulates beacon notification by notifying self
    this.testNotify = function(){
        var pkg = {};
        
        GitHub.initialize()
            .then(function(){ GitHub.getAccount(GitHub.me.login)
            .then(function(account){
                console.log('@testNotify: ' + JSON.stringify(account.info))
                pkg = {};
                pkg.target = Meteor.userId();
                pkg.notification = {
                    sender: account.info.login,
                    type: 'detection',
                    pictureUrl: account.info.avatar_url,
                    name: account.info.name,
                    timestamp: new Date()
                };
                Meteor.call('notify', pkg);
            }); 
        });
    }

};