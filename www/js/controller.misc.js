var log_test;
// controller.misc.js
// These are little controllers for various routes/views. See config.routes.js
angular.module('linkedin')
  
  .controller('NearbyCtrl', NearbyCtrl)             
  .controller('NearbyProfileCtrl', NearbyProfileCtrl)
  .controller('ProfileCtrl', ProfileCtrl)
  .controller('LoadingCtrl', LoadingCtrl)
  .controller('SettingsCtrl', SettingsCtrl)
  .controller('NotificationsCtrl', NotificationsCtrl)
  .controller('NotificationsProfileCtrl', NotificationsProfileCtrl)
  .controller('TabsCtrl', TabsCtrl)
  .controller('SetupCtrl', SetupCtrl)


// @controller: TabsCtrl
// @params: $scope, $reactive
// @route: /tab
//
// Exposes user profile var 'notifyCount' (the number of unchecked notifications)
// to the DOM to determine badge display over tab icon
function TabsCtrl ($scope, $reactive){
  $reactive(this).attach($scope);

  this.helpers({
      notifyCount: function () {
        if(Meteor.user()) 
          return Meteor.user().profile.notifyCount;
      }
  });  
};

// @controller: SetupCtrl
// @params: $scope, $state
// @route: /setup
//
// Functions to toggle state change when user approves requests for permission to use
// iBeacon and APNS on new account creation and new installs
function SetupCtrl ($scope, $state ){

  this.accept = function(){
    $state.go('tab.nearby');
  };

  this.reject = function(){
    $state.go('login');
  };

};

// @controller: NotificationsCtrl
// @params: $scope, $reactive
// @route: /tab/notifications
//
// Exposes array of notifications in user.profile to DOM for
// tab-notifications view
function NotificationsCtrl ($scope, $reactive){
  $reactive(this).attach($scope);
  
  this.helpers({
      notifications: function () {
        if(Meteor.user()) 
          return Meteor.user().profile.notifications;
      }
  });
 
};

// @controller NearbyCtrl
// @params: $scope, $reactive
// @route: /tab/nearby
//
// Exposes Meteor mongo 'connections' to DOM, filtered against current user as 'transmitter'
// Subscription to 'connections' is handled in the route resolve and checked here. Also
// exposes GeoLocate service (for the maps view) and Notify service (to trigger notification when user
// clicks on list item to see profile)
function NearbyCtrl ($scope, $reactive, Notify, GeoLocate ){
  $reactive(this).attach($scope);
  
  var self = this;

  // Slide constants bound to the GeoLocate directive
  // and other DOM events, trigger updates based on 
  // whether we are looking at List || Map view. 
  self.listSlide = 0
  self.mapSlide = 1;
  self.slide = 0; 

  // Services
  self.geolocate = GeoLocate;
  self.notify = Notify;

  self.helpers({
      connections: function () {
        return Connections.find( {transmitter: Meteor.userId() } )
      }
  });

};

// @controller: NotificationsProfileCtrl
// @params: $scope, $stateParams
// @route: /tab/notifications/:sender
//
// For child view of notifications which shows profile of tapped notification 
// Iterates through current user's array of notifications to 
// locate correct :sender and populates the default profile
// template. Is cached per unique $stateParams Meteor.userId
function NotificationsProfileCtrl ($scope, $stateParams){
  
  var self = this;
  var notes = Meteor.user().profile.notifications;

  self.user = null; // The note sender's profile;

  if (notes){
    for(var i = 0; i < notes.length; i++){
      if (notes[i].sender === $stateParams.sender){
        self.user = notes[i].profile; 
        self.user.name = this.user.firstName + ' ' + this.user.lastName;
        self.viewTitle = this.user.name;
        break;
      }
    }
  };

}

// @controller: NearbyProfileCtrl
// @params: $scope, $stateParams
// @route: /tab/nearby/:userId
//
// For child view of nearby which shows profile of tapped nearby list item. 
// Locates/caches profile object stored as part of Meteor mongo connections record
// and populates the default profile template. 
function NearbyProfileCtrl ($scope, $reactive, $stateParams ){
  $reactive(this).attach($scope);

  var self = this;
  
  // DB: Connections, get profile
  this.subscribe('connections');

  this.helpers({
    connection: function () {
      return Connections.findOne({'profile.id': $stateParams.userId});
    }
  });

  $scope.connection = self.connection;

  $scope.$watch('connection', function(newVal, oldVal){
    if (newVal){
      self.user = self.connection.profile;
      self.user.name = self.user.firstName + ' ' + self.user.lastName;
      self.viewTitle = self.user.name;
    }
  });

  /* Template vars
  self.user = self.connection.profile;
  self.user.name = self.user.firstName + ' ' + self.user.lastName;
  self.viewTitle = self.user.name;*/
  
};

// @controller: NearbyProfileCtrl
// @params: $scope, LinkedIn
// @route: /tab/profile
//
// Exposes LinkedIn.me profile object to default profile template
function ProfileCtrl ($scope, LinkedIn){
    
  this.user = LinkedIn.me;
  this.user.name = this.user.firstName + ' ' + this.user.lastName;
  this.viewTitle = "You";
  
};

// @controller: LoadingCtrl
// @params: $ionicPlatform, $state, $timeout, ionicToast
// @route: /loading
//
// Controller for the default/otherwise route. Waits for platform ready,
// then attempts to navigate to the 'nearby' tab, which will kick back
// to 'login' if there is a problem. Run 5s timeout to redirect to login with
// a warning toast if there's no Meteor server connection, because that causes the 
// nearby resolves to hang.
function LoadingCtrl ($ionicPlatform, $state, $timeout, ionicToast ){
   
  var self = this;

  $ionicPlatform.ready(function(){
      
      $state.go('tab.nearby');
      
      $timeout(function(){
        var message;

        if (Meteor.status().status != 'connected'){
          message = "There's a problem connecting to the server. Try again later."
          ionicToast.show(message, 'top', true, 2500);

          $state.go('login');
        }
      }, 5000)
  });
};

// @controller: SettingsCtrl
// @params: $scope, $state, GeoLocate, Notify, ionicToast
// @route: /settings
//
// Attempts to display current app permissions. Currently used for some useful
// developer testing functions, like clearing notifications etc. 
function SettingsCtrl($scope, $state, GeoLocate, Notify, ionicToast) {

  var message = "Go to Settings > LinkedIn in your device's settings menu to change this."
  this.geolocate = {enabled: true};
  this.notify = {enabled: true};

  this.logout = function() {
    Meteor.logout(function(err){
      $state.go('login');
    });
  }

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

  // Test Notify.sawProfile method by notifying self
  this.testNotify = function(){
    Notify.sawProfile(Meteor.userId());
  }

};


