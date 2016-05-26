angular.module('gitphaser')
  .controller('SettingsCtrl', SettingsCtrl);

// @controller: SettingsCtrl
// @params: $scope, $state, GeoLocate, Notify, ionicToast
// @route: /settings
//
// Attempts to display current app permissions. Currently used for some useful
// developer testing functions, like clearing notifications etc. 
function SettingsCtrl($scope, $state, $reactive, GeoLocate, Notify, ionicToast) {
  $reactive(this).attach($scope);

  var message = "Go to Settings > Git-Phaser in your device's settings menu to change this."
  this.geolocate = {enabled: true};
  this.notify = {enabled: true};

  this.logout = function() {
      $state.go('login');
  };
  
  this.toast = function(){
    ionicToast.show(message, 'middle', true, 2500);
  }

  // ------------------ -----  TESTING ----------------------------------
  // Test meteor method: disconnect by disconnecting any self-connections
  this.clearPub = function(){
    
    var pkg = {
      transmitter: Meteor.user().profile.appId,
      receiver: Meteor.user().emails[0].address,
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

  // Test meteor method: newConnection() by adding self to connections
  this.testPub = function(){

    var pkg = {
      transmitter: Meteor.user().emails[0].address,
      receiver: Meteor.user().emails[0].address,
      proximity: Math.random().toString()
    }
    Meteor.call('newConnection', pkg, function(err, connections){})
  };

  this.testChangeProximity = function(){
    var pkg = {
      transmitter: Meteor.user().emails[0].address,
      receiver: Meteor.user().emails[0].address,
      proximity: Math.random().toString()
    }

    Connections.update({transmitter: pkg.transmitter}, {$set: {proximity: pkg.proximity}});

  };

  // Test Notify.sawProfile method by notifying self
  this.testNotify = function(){
    Notify.sawProfile(Meteor.userId());
  }

};