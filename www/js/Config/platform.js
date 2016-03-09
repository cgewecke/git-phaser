angular
  .module('linkedin')
  .run(run);

// @function run 
// This is where all platformReady code goes
function run ($ionicPlatform, $rootScope, $auth, $state, Beacons ) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $rootScope.DEV = false;
    $rootScope.beaconsOFF = false;

  });
}