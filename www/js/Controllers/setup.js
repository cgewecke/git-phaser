angular.module('linkedin')
  .controller('SetupCtrl', SetupCtrl)

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